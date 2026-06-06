const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

// GET all fuel entries, with optional group filtering
router.get('/', asyncHandler(async (req, res) => {
  const { fuel_group_id } = req.query;
  let sql = 'SELECT * FROM fuel_entries';
  const params = [];
  
  if (fuel_group_id) {
    sql += ' WHERE fuel_group_id = ?';
    params.push(fuel_group_id);
  }
  
  sql += ' ORDER BY id DESC';
  const entries = await db.allAsync(sql, params);
  res.json(entries.map(e => ({ ...e, rate_slabs: JSON.parse(e.rate_slabs || '[]') })));
}));

// LOOKUP endpoint for active fuel price percentage
router.get('/lookup', asyncHandler(async (req, res) => {
  const { fuel_group_name, company_type, courier, booking_date } = req.query;
  
  if (!fuel_group_name || !company_type || !courier || !booking_date) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  // 1. Find the fuel group ID matching the name and type
  const group = await db.getAsync(
    'SELECT id FROM fuel_groups WHERE LOWER(name) = ? AND LOWER(type) = ?',
    [fuel_group_name.trim().toLowerCase(), company_type.trim().toLowerCase()]
  );

  if (!group) {
    return res.json({ success: true, fuel_price_pct: 0, reason: 'Fuel group not found' });
  }

  // 2. Find the fuel entry for this group and courier that covers the booking_date
  // We check courier match first (case-insensitive), or fallback to 'All'
  const entries = await db.allAsync(
    `SELECT * FROM fuel_entries 
     WHERE fuel_group_id = ? 
       AND (LOWER(fuel_courier) = ? OR LOWER(fuel_courier) = 'all')
       AND (fuel_from_date <= ? AND fuel_to_date >= ?)
     ORDER BY CASE WHEN LOWER(fuel_courier) = ? THEN 0 ELSE 1 END ASC, id DESC`,
    [group.id, courier.trim().toLowerCase(), booking_date, booking_date, courier.trim().toLowerCase()]
  );

  if (entries.length > 0) {
    return res.json({
      success: true,
      fuel_price_pct: entries[0].fuel_price_pct,
      entry: entries[0]
    });
  }

  return res.json({ success: true, fuel_price_pct: 0, reason: 'No matching fuel entry found' });
}));

// POST new fuel entry
router.post('/', asyncHandler(async (req, res) => {
  const {
    fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs,
    fuel_group_id
  } = req.body;
  
  const result = await db.runAsync(`
    INSERT INTO fuel_entries (
      fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs,
      fuel_group_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
    JSON.stringify(rate_slabs || []), fuel_group_id || null
  ]);
  
  res.json({ success: true, id: result.lastID });
}));

// PUT update fuel entry
router.put('/:id', asyncHandler(async (req, res) => {
  const {
    fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs,
    fuel_group_id
  } = req.body;
  
  await db.runAsync(`
    UPDATE fuel_entries SET
      fuel_courier=?, fuel_price_pct=?, company_type=?, docket_charge=?, customer=?,
      fov_min=?, fov_above=?, fov_below=?, fov_base=?, appointment_min=?, appointment_per_kg=?,
      fuel_from_date=?, fuel_to_date=?, cft=?, air_cft=?, calculate_on=?, cod_fixed=?, topay_fixed=?, rate_slabs=?,
      fuel_group_id=?
    WHERE id=?
  `, [
    fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
    JSON.stringify(rate_slabs || []), fuel_group_id || null, req.params.id
  ]);
  
  res.json({ success: true });
}));

// DELETE fuel entry
router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM fuel_entries WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
