const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/export', asyncHandler(async (req, res) => {
  const report = await db.allAsync(`
    SELECT s.*, c.name as customer_name, c.code as customer_code
    FROM shipments s
    LEFT JOIN customers c ON s.customer_id = c.id
  `);
  res.json(report);
}));

module.exports = router;
