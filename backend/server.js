const express = require('express');
const cors = require('cors');
require('./db'); // ensure DB initialization runs

const app = express();
const PORT = 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';"
  );
  next();
});

// Security middleware: Reject any code script injection or path traversal attempts in URLs with a 302 redirect
app.use((req, res, next) => {
  try {
    const urlDecoded = decodeURIComponent(req.originalUrl);
    const suspiciousPattern = /(<|%3C)script(|s|>)|javascript:|(<|%3C)[a-z]+(>|%3E)|(\.\.\/|\.\.\\)/i;
    if (suspiciousPattern.test(urlDecoded)) {
      console.warn(`[SECURITY ALERT] Suspicious URL blocked: ${req.originalUrl}`);
      return res.redirect(302, 'http://127.0.0.1:3000/');
    }
  } catch (e) {
    return res.redirect(302, 'http://127.0.0.1:3000/');
  }
  next();
});

app.use(express.json());

// Middleware to force uppercase for all string inputs except specified exclusions
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const exclusions = ['password', 'email', 'website', 'logo'];
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
app.use('/api', require('./routes/shipping'));
app.use('/api', require('./routes/misc'));

// --- Error Handler Middleware ---
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
