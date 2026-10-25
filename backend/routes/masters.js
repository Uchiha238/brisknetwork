const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

router.get('/states', asyncHandler(async (req, res) => {
  const states = await db.allAsync('SELECT * FROM states ORDER BY name ASC');
  res.json(states);
}));

router.get('/cities', asyncHandler(async (req, res) => {
  const { state_id } = req.query;
  const sql = state_id ? 'SELECT * FROM cities WHERE state_id = ? ORDER BY name ASC' : 'SELECT * FROM cities ORDER BY name ASC';
  const params = state_id ? [state_id] : [];
  const cities = await db.allAsync(sql, params);
  res.json(cities);
}));

router.get('/countries', asyncHandler(async (req, res) => {
  const countries = await db.allAsync('SELECT * FROM countries ORDER BY name ASC');
  res.json(countries);
}));

router.get('/rate-groups', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const sql = type ? 'SELECT * FROM rate_groups WHERE type = ?' : 'SELECT * FROM rate_groups';
  const params = type ? [type] : [];
  const groups = await db.allAsync(sql, params);
  res.json(groups);
}));

router.get('/fuel-groups', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const sql = type ? 'SELECT * FROM fuel_groups WHERE type = ?' : 'SELECT * FROM fuel_groups';
  const params = type ? [type] : [];
  const groups = await db.allAsync(sql, params);
  res.json(groups);
}));

router.post('/fuel-groups', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['name', 'type']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { name, type } = req.body;
  try {
    const result = await db.runAsync('INSERT INTO fuel_groups (name, type) VALUES (?, ?)', [name.trim(), type]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'A fuel group with this name already exists.' });
    throw err;
  }
}));

router.put('/fuel-groups/:id', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['name', 'type']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { name, type } = req.body;
  try {
    await db.runAsync('UPDATE fuel_groups SET name = ?, type = ? WHERE id = ?', [name.trim(), type, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'A fuel group with this name already exists.' });
    throw err;
  }
}));

router.delete('/fuel-groups/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM fuel_groups WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// --- GST Master Endpoints ---
router.get('/gst', asyncHandler(async (req, res) => {
  const records = await db.allAsync('SELECT * FROM gst_masters ORDER BY sr ASC, id ASC');
  res.json(records);
}));

router.post('/gst', asyncHandler(async (req, res) => {
  const { sr, from_date, to_date, cgst, sgst } = req.body;
  const result = await db.runAsync(
    'INSERT INTO gst_masters (sr, from_date, to_date, cgst, sgst) VALUES (?, ?, ?, ?, ?)',
    [sr || 1, from_date, to_date, parseFloat(cgst) || 9.0, parseFloat(sgst) || 9.0]
  );
  res.json({ success: true, id: result.lastID });
}));

router.put('/gst/:id', asyncHandler(async (req, res) => {
  const { from_date, to_date, cgst, sgst } = req.body;
  await db.runAsync(
    'UPDATE gst_masters SET from_date = ?, to_date = ?, cgst = ?, sgst = ? WHERE id = ?',
    [from_date, to_date, parseFloat(cgst) || 9.0, parseFloat(sgst) || 9.0, req.params.id]
  );
  res.json({ success: true });
}));

router.delete('/gst/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM gst_masters WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
