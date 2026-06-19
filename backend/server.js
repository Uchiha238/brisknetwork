const express = require('express');
require('dotenv').config();
require('./db'); // ensure DB initialization runs

const app = express();
const PORT = process.env.PORT || 5000;

// ALLOWED_ORIGIN can be a comma-separated list of origins (set in production env)
const allowedOrigins = [
  'http://localhost:3100',
  'http://127.0.0.1:3100',
  ...(process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim()) : [])
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const { logSecurityEvent } = require('./utils/logger');

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';"
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Basic in-memory rate limiting middleware (100 requests per minute per IP)
const rateLimitWindow = 60 * 1000;
const maxRequests = 100;
const ipRequestCounts = new Map();
setInterval(() => ipRequestCounts.clear(), rateLimitWindow);

app.use((req, res, next) => {
  const ip = req.ip;
  const count = ipRequestCounts.get(ip) || 0;
  if (count >= maxRequests) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', `IP ${ip} exceeded rate limit with ${count + 1} requests`, ip);
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  ipRequestCounts.set(ip, count + 1);
  next();
});

// Security middleware: Reject any code script injection or path traversal attempts in URLs
app.use((req, res, next) => {
  try {
    const urlDecoded = decodeURIComponent(req.originalUrl);
    const suspiciousPattern = /(<|%3C)script(|s|>)|javascript:|(<|%3C)[a-z]+(>|%3E)|(\.\.\/|\.\.\\)/i;
    if (suspiciousPattern.test(urlDecoded)) {
      console.warn(`[SECURITY ALERT] Suspicious URL blocked: ${req.originalUrl}`);
      logSecurityEvent('SUSPICIOUS_URL', `Blocked URL injection: ${req.originalUrl}`, req.ip);
      return res.status(400).json({ error: "Invalid request" });
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid request" });
  }
  next();
});

// Tracker for repeated validation failures (status 400)
const validationFailuresWindow = 60 * 1000; // 1 minute
const validationFailureThreshold = 5;
const ipValidationFailures = new Map();
setInterval(() => ipValidationFailures.clear(), validationFailuresWindow);

function trackValidationFailure(ip, url, errMsg) {
  const failures = ipValidationFailures.get(ip) || [];
  failures.push({ timestamp: Date.now(), url, error: errMsg });
  ipValidationFailures.set(ip, failures);

  const now = Date.now();
  const recentFailures = failures.filter(f => now - f.timestamp < validationFailuresWindow);
  ipValidationFailures.set(ip, recentFailures);

  if (recentFailures.length >= validationFailureThreshold) {
    logSecurityEvent(
      'REPEATED_VALIDATION_FAILURES',
      `IP ${ip} hit validation failures ${recentFailures.length} times in 1 min. Last error: ${errMsg} on ${url}`,
      ip
    );
  }
}

// Intercept res.json to catch validation/400 errors
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode === 400 && body && (body.error || body.errors || body.success === false)) {
      const errMsg = body.error || (body.errors ? JSON.stringify(body.errors) : JSON.stringify(body));
      trackValidationFailure(req.ip, req.originalUrl, errMsg);
    }
    return originalJson.apply(this, arguments);
  };
  next();
});

app.use(express.json());

const sanitizer = require('./utils/sanitizer');

// Global Route Parameter Validation Guards
app.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID parameter format. Must be numeric.' });
  }
  next();
});

app.param('pincode', (req, res, next, pincode) => {
  if (!/^\d+$/.test(pincode)) {
    return res.status(400).json({ success: false, error: 'Invalid Pincode parameter format. Must be numeric.' });
  }
  next();
});

// Centralized input sanitization middleware with change tracking (to log sanitizer triggers)
app.use((req, res, next) => {
  const exclusions = ['password', 'fileData'];
  
  let triggered = false;
  const detectTrigger = (oldVal, newVal) => {
    if (triggered) return;
    if (typeof oldVal !== typeof newVal) return;
    if (typeof oldVal === 'string') {
      if (oldVal !== newVal) {
        triggered = true;
      }
    } else if (Array.isArray(oldVal)) {
      for (let i = 0; i < oldVal.length; i++) {
        detectTrigger(oldVal[i], newVal[i]);
      }
    } else if (typeof oldVal === 'object' && oldVal !== null && newVal !== null) {
      for (const key in oldVal) {
        detectTrigger(oldVal[key], newVal[key]);
      }
    }
  };

  if (req.body) {
    const originalBody = JSON.parse(JSON.stringify(req.body));
    req.body = sanitizer.sanitizeObject(req.body, exclusions);
    detectTrigger(originalBody, req.body);
  }
  if (req.query) {
    const originalQuery = JSON.parse(JSON.stringify(req.query));
    req.query = sanitizer.sanitizeObject(req.query, exclusions);
    detectTrigger(originalQuery, req.query);
  }
  if (req.params) {
    const originalParams = JSON.parse(JSON.stringify(req.params));
    req.params = sanitizer.sanitizeObject(req.params, exclusions);
    detectTrigger(originalParams, req.params);
  }

  if (triggered) {
    logSecurityEvent('SANITIZER_TRIGGERED', 'Input sanitizer stripped unsafe HTML/Script tags from request payload', req.ip);
  }
  next();
});

// Middleware to force uppercase for all string inputs except specified exclusions
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const exclusions = ['password', 'email', 'website', 'logo', 'fileData'];
    const convertToCaps = (obj) => {
      for (const key in obj) {
        if (exclusions.includes(key)) continue;
        
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].toUpperCase();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          convertToCaps(obj[key]);
        }
      }
    };
    convertToCaps(req.body);
  }
  next();
});

// --- Register Modular Routers ---
app.use('/api', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/masters', require('./routes/masters'));
app.use('/api/company', require('./routes/company'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/fuel-entries', require('./routes/fuel'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api', require('./routes/shipping'));
app.use('/api', require('./routes/misc'));

// --- Error Handler Middleware ---
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Something went wrong' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
