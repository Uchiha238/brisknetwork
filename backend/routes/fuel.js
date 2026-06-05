const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const entries = await db.allAsync('SELECT * FROM fuel_entries ORDER BY id DESC');
  res.json(entries.map(e => ({ ...e, rate_slabs: JSON.parse(e.rate_slabs || '[]') })));
}));

router.post('/', asyncHandler(async (req, res) => {
  const {
    fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
  } = req.body;
  const result = await db.runAsync(`
    INSERT INTO fuel_entries (
      fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
    JSON.stringify(rate_slabs || [])
  ]);
  res.json({ success: true, id: result.lastID });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const {
    fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
  } = req.body;
  await db.runAsync(`
    UPDATE fuel_entries SET
      fuel_courier=?, fuel_price_pct=?, company_type=?, docket_charge=?, customer=?,
      fov_min=?, fov_above=?, fov_below=?, fov_base=?, appointment_min=?, appointment_per_kg=?,
      fuel_from_date=?, fuel_to_date=?, cft=?, air_cft=?, calculate_on=?, cod_fixed=?, topay_fixed=?, rate_slabs=?
    WHERE id=?
  `, [
    fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
    fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
    fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
    JSON.stringify(rate_slabs || []), req.params.id
  ]);
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM fuel_entries WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
