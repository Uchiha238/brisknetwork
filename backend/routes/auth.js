const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await db.getAsync('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}));

module.exports = router;
