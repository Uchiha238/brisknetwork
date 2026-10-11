const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'om-courier-secure-session-key-2026-auth-layer';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Generate a cryptographically signed HMAC-SHA256 JWT
 * @param {object} payload - user data to encode
 * @param {number} expiresInSeconds - validity duration (default: 7 days)
 */
function generateToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 JWT signature and check expiration
 * @param {string} token 
 * @returns {object|null} payload if valid, null otherwise
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to guard protected routes
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Session is invalid or has expired. Please log in again.',
      code: 'TOKEN_INVALID'
    });
  }

  req.user = user;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  requireAuth
};
