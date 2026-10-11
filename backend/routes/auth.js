const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const { generateToken, requireAuth } = require('../utils/auth');

router.post('/login', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['username', 'password']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { username, password } = req.body;
  const user = await db.getAsync('SELECT * FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) AND password = ?', [username, password]);
  
  if (user) {
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    // Set secure HttpOnly session cookie
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${isSecure ? '; Secure' : ''}`);

    res.json({
      success: true,
      token, // Also provided in JSON for API/script clients
      user: { id: user.id, username: user.username, role: user.role }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
}));

// Logout endpoint to clear HttpOnly cookie
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Validate active token & return current authenticated user
router.get('/auth/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db.getAsync('SELECT id, username, role FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User no longer exists' });
  }
  res.json({ success: true, user });
}));

router.post('/auth/verify', requireAuth, (req, res) => {
  res.json({ success: true, valid: true, user: req.user });
});

module.exports = router;

