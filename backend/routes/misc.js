const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

// --- Dashboard Routes ---
router.get('/dashboard', asyncHandler(async (req, res) => {
  const customerCount = (await db.getAsync('SELECT count(*) as count FROM customers')).count;
  const shipmentCount = (await db.getAsync('SELECT count(*) as count FROM shipments')).count;
  const statusDistribution = await db.allAsync('SELECT status, count(*) as count FROM shipments GROUP BY status');
  
  res.json({
    totalCustomers: customerCount,
    totalShipments: shipmentCount,
    statusDistribution: statusDistribution
  });
}));

// --- Mail Config (SMTP) ---
router.get('/mail-config', asyncHandler(async (req, res) => {
  const row = await db.getAsync('SELECT * FROM mail_config ORDER BY id ASC LIMIT 1');
  res.json(row || {});
}));

router.post('/mail-config', asyncHandler(async (req, res) => {
  const { port_no, host, username, password } = req.body;
  const result = await db.runAsync(
    'INSERT INTO mail_config (port_no, host, username, password) VALUES (?, ?, ?, ?)',
    [port_no, host, username, password]
  );
  res.json({ success: true, id: result.lastID });
}));

router.put('/mail-config/:id', asyncHandler(async (req, res) => {
  const { port_no, host, username, password } = req.body;
  await db.runAsync(
    'UPDATE mail_config SET port_no=?, host=?, username=?, password=? WHERE id=?',
    [port_no, host, username, password, req.params.id]
  );
  res.json({ success: true });
}));

module.exports = router;
