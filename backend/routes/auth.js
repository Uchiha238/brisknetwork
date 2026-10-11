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

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
}));

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

