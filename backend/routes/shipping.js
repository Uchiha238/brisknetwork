const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

// --- Pincode Route ---
router.get('/pincode/:pincode', asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  const row = await db.getAsync('SELECT * FROM local_pincodes WHERE pincode = ?', [pincode]);
  if (row) {
    res.json({
      success: true,
      data: {
          city: row.area,
          state: row.state_desc,
          zone: row.zone
      }
    });
  } else {
    res.status(404).json({ success: false, error: 'Pincode not found' });
  }
}));

// --- International Zone Route ---
router.get('/international-zone', asyncHandler(async (req, res) => {
  const { country, courier, type } = req.query;
  if (!country || !courier) {
    return res.status(400).json({ success: false, error: 'country and courier parameters are required' });
  }
  
  let countryUpper = country.toString().trim().toUpperCase();
  if (countryUpper === 'USA' || countryUpper === 'UNITED STATES' || countryUpper === 'US') {
    countryUpper = 'UNITED STATES OF AMERICA';
  }
  const courierUpper = courier.toString().trim().toUpperCase();
  const typeUpper = type ? type.toString().trim().toUpperCase() : 'EXPORT';
  
  // Exact match
  let row = await db.getAsync(
    'SELECT zone FROM international_zones WHERE country = ? AND courier = ? AND type = ?',
    [countryUpper, courierUpper, typeUpper]
  );
  
  // Fuzzy match
  if (!row) {
    row = await db.getAsync(
      'SELECT zone FROM international_zones WHERE (country LIKE ? OR ? LIKE "%" || country || "%") AND courier = ? AND type = ?',
      [`%${countryUpper}%`, countryUpper, courierUpper, typeUpper]
    );
  }
  
  if (row) {
    res.json({
      success: true,
      zone: row.zone
    });
  } else {
    res.status(404).json({ success: false, error: 'Zone not found for the specified country and courier' });
  }
}));

// --- International Rate Route ---
router.get('/international-rate', asyncHandler(async (req, res) => {
  const { courier, weight, zone } = req.query;
  if (!courier || !weight || !zone) {
    return res.status(400).json({ success: false, error: 'courier, weight, and zone parameters are required' });
  }
  
  const courierUpper = courier.toString().trim().toUpperCase();
  const weightVal = parseFloat(weight);
  const zoneVal = zone.toString().trim();
  
  if (isNaN(weightVal)) {
    return res.status(400).json({ success: false, error: 'weight must be a valid number' });
  }
  
  // Find the smallest to_weight that is greater than or equal to the requested weight
  let row = await db.getAsync(
    'SELECT rate, fixed_perkg, to_weight FROM international_rates WHERE courier = ? AND zone = ? AND to_weight >= ? ORDER BY to_weight ASC LIMIT 1',
    [courierUpper, zoneVal, weightVal]
  );

  // Fallback: If no slab is >= requested weight, use the maximum available weight slab
  let isFallback = false;
  if (!row) {
    row = await db.getAsync(
      'SELECT rate, fixed_perkg, to_weight FROM international_rates WHERE courier = ? AND zone = ? ORDER BY to_weight DESC LIMIT 1',
      [courierUpper, zoneVal]
    );
    if (row) {
      isFallback = true;
    }
  }
  
  if (row) {
    let finalRate = row.rate;
    if (row.fixed_perkg === 1) {
      finalRate = row.rate * weightVal;
    }
    res.json({
      success: true,
      rate: finalRate,
      baseRate: row.rate,
      fixed_perkg: row.fixed_perkg,
      to_weight: row.to_weight,
      isFallback
    });
  } else {
    res.status(404).json({ success: false, error: 'Rate slab not found for the specified parameters' });
  }
}));

// --- Modes Routes ---
router.get('/modes', asyncHandler(async (req, res) => {
  const modes = await db.allAsync('SELECT * FROM modes ORDER BY id');
  res.json(modes);
}));

router.post('/modes', asyncHandler(async (req, res) => {
  const { name, type } = req.body;
  const result = await db.runAsync('INSERT INTO modes (name, type) VALUES (?, ?)', [name.toUpperCase(), type || 'Domestic']);
  res.json({ success: true, id: result.lastID });
}));

router.delete('/modes/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM modes WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
