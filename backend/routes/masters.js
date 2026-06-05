const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

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
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required' });
  try {
    const result = await db.runAsync('INSERT INTO fuel_groups (name, type) VALUES (?, ?)', [name.trim(), type]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'A fuel group with this name already exists.' });
    throw err;
  }
}));

router.put('/fuel-groups/:id', asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required' });
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

module.exports = router;
