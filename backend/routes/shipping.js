const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const xlsx = require('xlsx');
const validate = require('../utils/validate');
const { logSecurityEvent } = require('../utils/logger');

function sanitizeSpreadsheetCell(val) {
  if (val === undefined || val === null) return val;
  const str = val.toString().trim();
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    return `'${str}`;
  }
  return str;
}

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
  const reqErr = validate.required(req.query, ['country', 'courier']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { country, courier, type, booking_date } = req.query;
  
  let countryUpper = country.toString().trim().toUpperCase();
  if (countryUpper === 'USA' || countryUpper === 'UNITED STATES' || countryUpper === 'US') {
    countryUpper = 'UNITED STATES OF AMERICA';
  }
  const courierUpper = courier.toString().trim().toUpperCase();
  const typeUpper = type ? type.toString().trim().toUpperCase() : 'EXPORT';
  const bookingDateVal = (booking_date || new Date().toISOString().split('T')[0]).toString().trim();
  
  // Exact match
  let row = await db.getAsync(
    'SELECT zone FROM international_zones WHERE country = ? AND courier = ? AND type = ? AND (effective_from <= ? AND effective_to >= ?) ORDER BY effective_from DESC LIMIT 1',
    [countryUpper, courierUpper, typeUpper, bookingDateVal, bookingDateVal]
  );
  
  // Fuzzy match
  if (!row) {
    row = await db.getAsync(
      'SELECT zone FROM international_zones WHERE (country LIKE ? OR ? LIKE "%" || country || "%") AND courier = ? AND type = ? AND (effective_from <= ? AND effective_to >= ?) ORDER BY effective_from DESC LIMIT 1',
      [`%${countryUpper}%`, countryUpper, courierUpper, typeUpper, bookingDateVal, bookingDateVal]
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
  const reqErr = validate.required(req.query, ['courier', 'weight', 'zone']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const numErr = validate.number(req.query.weight, 'weight');
  if (numErr) return res.status(400).json({ success: false, error: numErr });

  const { courier, weight, zone, product, mode, booking_date } = req.query;
  
  const courierUpper = courier.toString().trim().toUpperCase();
  const weightVal = parseFloat(weight);
  const zoneVal = zone.toString().trim();
  
  const modeVal = (mode || 'EXPORT').toString().trim().toUpperCase();
  const docTypeVal = (product || 'DOCUMENTS').toString().trim().toUpperCase() === 'PARCEL' ? 'NON-DOC' : 'DOC';
  const bookingDateVal = (booking_date || new Date().toISOString().split('T')[0]).toString().trim();
  
  if (isNaN(weightVal)) {
    return res.status(400).json({ success: false, error: 'weight must be a valid number' });
  }
  
  // Find the smallest to_weight that is greater than or equal to the requested weight, covering the booking date
  let row = await db.getAsync(
    'SELECT rate, fixed_perkg, to_weight FROM international_rates WHERE courier = ? AND export_import = ? AND doc_type = ? AND zone = ? AND (effective_from <= ? AND effective_to >= ?) AND to_weight >= ? ORDER BY to_weight ASC LIMIT 1',
    [courierUpper, modeVal, docTypeVal, zoneVal, bookingDateVal, bookingDateVal, weightVal]
  );

  // Fallback: If no slab is >= requested weight, use the maximum available weight slab covering the booking date
  let isFallback = false;
  if (!row) {
    row = await db.getAsync(
      'SELECT rate, fixed_perkg, to_weight FROM international_rates WHERE courier = ? AND export_import = ? AND doc_type = ? AND zone = ? AND (effective_from <= ? AND effective_to >= ?) ORDER BY to_weight DESC LIMIT 1',
      [courierUpper, modeVal, docTypeVal, zoneVal, bookingDateVal, bookingDateVal]
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
  const reqErr = validate.required(req.body, ['name']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { name, type } = req.body;
  const result = await db.runAsync('INSERT INTO modes (name, type) VALUES (?, ?)', [name.toUpperCase(), type || 'Domestic']);
  res.json({ success: true, id: result.lastID });
}));

router.delete('/modes/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM modes WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// --- Get Distinct Uploaded Rate Groups ---
router.get('/international-rates/groups', asyncHandler(async (req, res) => {
  const rows = await db.allAsync(`
    SELECT DISTINCT courier, export_import, effective_from, effective_to
    FROM international_rates
    ORDER BY effective_from DESC, courier ASC
  `);
  res.json({ success: true, data: rows });
}));

// --- Delete Rate Group ---
router.delete('/international-rates/groups', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.query, ['courier', 'export_import', 'effective_from', 'effective_to']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { courier, export_import, effective_from, effective_to } = req.query;
  
  await db.runAsync(`
    DELETE FROM international_rates
    WHERE courier = ? AND export_import = ? AND effective_from = ? AND effective_to = ?
  `, [courier, export_import, effective_from, effective_to]);
  
  res.json({ success: true });
}));

// --- Upload Rate Sheet ---
router.post('/international-rates/upload', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['courier', 'export_import', 'effective_from', 'effective_to', 'fileData']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { courier, export_import, effective_from, effective_to, fileData } = req.body;

  if (fileData.length > 7000000) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Rates spreadsheet base64 payload size exceeded 5MB', req.ip);
    return res.status(400).json({ success: false, error: 'File size exceeds maximum limit of 5MB.' });
  }

  const effFrom = effective_from.trim();
  const effTo = effective_to.trim();
  const fileBuffer = Buffer.from(fileData, 'base64');

  let workbook;
  try {
    workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Failed to parse file: ' + err.message });
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const allLines = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (!allLines || allLines.length < 1) {
    return res.status(400).json({ success: false, error: 'Empty rate sheet' });
  }

  if (allLines.length > 5000) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Rates spreadsheet rows count exceeded 5000', req.ip);
    return res.status(400).json({ success: false, error: 'Row limit exceeded. Maximum allowed rows: 5000.' });
  }

  if (allLines[0] && allLines[0].length > 100) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Rates spreadsheet columns count exceeded 100', req.ip);
    return res.status(400).json({ success: false, error: 'Column limit exceeded. Maximum allowed columns: 100.' });
  }

  let headerRowIndex = -1;
  let weightColIndex = -1;

  for (let i = 0; i < allLines.length; i++) {
    const row = allLines[i];
    if (!row) continue;
    const weightIdx = row.findIndex(cell => cell && cell.toString().trim().toLowerCase().includes('weight'));
    if (weightIdx !== -1) {
      headerRowIndex = i;
      weightColIndex = weightIdx;
      break;
    }
  }

  if (headerRowIndex === -1 || weightColIndex === -1) {
    return res.status(400).json({ success: false, error: 'Invalid file format: could not locate "Weight" column' });
  }

  const headers = allLines[headerRowIndex];

  const zones = [];
  for (let j = weightColIndex + 1; j < headers.length; j++) {
    if (headers[j] !== undefined && headers[j] !== null && headers[j].toString().trim() !== '') {
      zones.push({ index: j, name: headers[j].toString().trim().toUpperCase() });
    }
  }

  if (zones.length === 0) {
    return res.status(400).json({ success: false, error: 'No zones detected in header row' });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const sanitizedCourier = sanitizeSpreadsheetCell(courier);
    const sanitizedExportImport = sanitizeSpreadsheetCell(export_import);

    db.run(
      `DELETE FROM international_rates WHERE courier = ? AND export_import = ? AND effective_from = ? AND effective_to = ?`,
      [sanitizedCourier.toUpperCase(), sanitizedExportImport.toUpperCase(), effFrom, effTo],
      (delErr) => {
        if (delErr) {
          db.run("ROLLBACK");
          return res.status(500).json({ success: false, error: 'Failed to clear old rates: ' + delErr.message });
        }
      }
    );

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO international_rates 
      (courier, export_import, doc_type, rate_type, from_weight, to_weight, zone, rate, fixed_perkg, effective_from, effective_to) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    let errors = [];

    for (let i = headerRowIndex + 1; i < allLines.length; i++) {
      const cols = allLines[i];
      if (!cols || cols.length <= weightColIndex) continue;

      const weightRange = (cols[weightColIndex] || '').toString().trim();
      if (!weightRange) continue;

      const weightParts = weightRange.split('-');
      let fromWeight = 0;
      let toWeight = 0;
      if (weightParts.length === 2) {
        fromWeight = parseFloat(weightParts[0]) || 0;
        toWeight = parseFloat(weightParts[1]) || 0;
      } else {
        fromWeight = parseFloat(weightRange) || 0;
        toWeight = parseFloat(weightRange) || 0;
      }

      if (isNaN(fromWeight) || isNaN(toWeight)) continue;

      let rowExportImport = sanitizedExportImport.toUpperCase();
      let rowDocType = toWeight <= 2.0 ? 'DOC' : 'NON-DOC';
      let rowRateType = toWeight > 30 ? 'PER KG' : 'FIXED';

      for (let j = 0; j < weightColIndex; j++) {
        const headerVal = (headers[j] || '').toString().trim().toLowerCase();
        const cellVal = sanitizeSpreadsheetCell((cols[j] || '').toString().trim().toUpperCase());
        if (!cellVal) continue;

        if (headerVal.includes('export') || headerVal.includes('import') || headerVal.includes('mode')) {
          if (cellVal.includes('EXPORT') || cellVal.includes('IMPORT')) {
            rowExportImport = cellVal;
          }
        } else if (headerVal.includes('doc') || headerVal.includes('parcel') || headerVal.includes('product')) {
          if (cellVal.includes('NON-DOC') || cellVal.includes('NON DOC') || cellVal.includes('PARCEL')) {
            rowDocType = 'NON-DOC';
          } else if (cellVal.includes('DOC')) {
            rowDocType = 'DOC';
          }
        } else if (headerVal.includes('type') || headerVal.includes('slab')) {
          if (cellVal.includes('PER KG') || cellVal.includes('PER_KG') || cellVal.includes('PERKG')) {
            rowRateType = 'PER KG';
          } else if (cellVal.includes('FIXED')) {
            rowRateType = 'FIXED';
          }
        }
      }

      const fixedPerKg = rowRateType === 'PER KG' ? 1 : 0;

      zones.forEach(zone => {
        const rateVal = parseFloat(cols[zone.index]);
        if (!isNaN(rateVal)) {
          stmt.run(
            sanitizedCourier.toUpperCase(),
            rowExportImport,
            rowDocType,
            rowRateType,
            fromWeight,
            toWeight,
            sanitizeSpreadsheetCell(zone.name),
            rateVal,
            fixedPerKg,
            effFrom,
            effTo,
            (err) => {
              if (err) {
                errors.push(err.message);
              }
            }
          );
          count++;
        }
      });
    }

    stmt.finalize();

    db.run("COMMIT", (commitErr) => {
      if (commitErr) {
        db.run("ROLLBACK");
        return res.status(500).json({ success: false, error: 'Commit transaction failed: ' + commitErr.message });
      }
      res.json({ success: true, count, warnings: errors.slice(0, 5) });
    });
  });
}));

// --- Get Distinct Uploaded Zone Groups ---
router.get('/international-zones/groups', asyncHandler(async (req, res) => {
  const rows = await db.allAsync(`
    SELECT DISTINCT courier, type, effective_from, effective_to, uploaded_by, uploaded_at
    FROM international_zones
    ORDER BY uploaded_at DESC, courier ASC
  `);
  res.json({ success: true, data: rows });
}));

// --- Get Detailed Zone Mappings ---
router.get('/international-zones/mappings', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.query, ['courier', 'type', 'effective_from', 'effective_to']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { courier, type, effective_from, effective_to, search } = req.query;
  
  let sql = `
    SELECT id, country, country_code, zone 
    FROM international_zones 
    WHERE courier = ? AND type = ? AND effective_from = ? AND effective_to = ?
  `;
  const params = [courier, type, effective_from, effective_to];
  
  if (search) {
    sql += ` AND (country LIKE ? OR country_code LIKE ? OR zone LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }
  
  sql += ` ORDER BY country ASC`;
  const rows = await db.allAsync(sql, params);
  res.json({ success: true, data: rows });
}));

// --- Delete Zone Group ---
router.delete('/international-zones/groups', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.query, ['courier', 'type', 'effective_from', 'effective_to']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { courier, type, effective_from, effective_to } = req.query;
  
  await db.runAsync(`
    DELETE FROM international_zones
    WHERE courier = ? AND type = ? AND effective_from = ? AND effective_to = ?
  `, [courier, type, effective_from, effective_to]);
  
  res.json({ success: true });
}));

// --- Download Sample Zone File ---
router.get('/international-zones/sample', (req, res) => {
  const wb = xlsx.utils.book_new();
  const data = [
    ['Country', 'Country Code', 'Zone'],
    ['India', 'IN', 'A'],
    ['United States', 'US', 'B'],
    ['Germany', 'DE', 'C'],
    ['United Kingdom', 'GB', 'C'],
    ['Canada', 'CA', 'B']
  ];
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Zones Sample');
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Disposition', 'attachment; filename=international_zones_sample.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// --- Upload Zone File ---
router.post('/international-zones/upload', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['courier', 'type', 'effective_from', 'effective_to', 'fileData']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { courier, type, effective_from, effective_to, fileData } = req.body;

  if (fileData.length > 7000000) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Zones spreadsheet base64 payload size exceeded 5MB', req.ip);
    return res.status(400).json({ success: false, error: 'File size exceeds maximum limit of 5MB.' });
  }

  if (effective_from > effective_to) {
    return res.status(400).json({ success: false, error: 'Valid From date cannot be greater than Valid To date' });
  }

  const fileBuffer = Buffer.from(fileData, 'base64');
  let workbook;
  try {
    workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid file format: ' + err.message });
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const allLines = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (!allLines || allLines.length <= 1) {
    return res.status(400).json({ success: false, error: 'The uploaded file is empty or missing headers' });
  }

  if (allLines.length > 5000) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Zones spreadsheet rows count exceeded 5000', req.ip);
    return res.status(400).json({ success: false, error: 'Row limit exceeded. Maximum allowed rows: 5000.' });
  }

  if (allLines[0] && allLines[0].length > 100) {
    logSecurityEvent('UPLOAD_LIMIT_EXCEEDED', 'Zones spreadsheet columns count exceeded 100', req.ip);
    return res.status(400).json({ success: false, error: 'Column limit exceeded. Maximum allowed columns: 100.' });
  }

  const headers = allLines[0].map(h => (h || '').toString().trim());
  const requiredHeaders = ['Country', 'Country Code', 'Zone'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    return res.status(400).json({ 
      success: false, 
      error: `Invalid file structure. Missing required columns: ${missingHeaders.join(', ')}. Column names must match the template exactly.` 
    });
  }

  const countryColIdx = headers.indexOf('Country');
  const codeColIdx = headers.indexOf('Country Code');
  const zoneColIdx = headers.indexOf('Zone');

  const validCodesList = await db.allAsync("SELECT code FROM countries");
  const validCodes = new Set(validCodesList.map(r => r.code.toString().trim().toUpperCase()));

  const errors = [];
  const processedCountries = new Set();
  const validRows = [];

  for (let i = 1; i < allLines.length; i++) {
    const row = allLines[i];
    if (!row || row.length === 0 || row.every(cell => cell === null || cell === undefined || cell.toString().trim() === '')) {
      continue;
    }

    const rowNum = i + 1;
    const country = sanitizeSpreadsheetCell((row[countryColIdx] || '').toString().trim());
    const code = sanitizeSpreadsheetCell((row[codeColIdx] || '').toString().trim().toUpperCase());
    const zone = sanitizeSpreadsheetCell((row[zoneColIdx] || '').toString().trim().toUpperCase());

    if (!country) {
      errors.push(`Row ${rowNum}: Country name is missing`);
      continue;
    }

    if (!zone) {
      errors.push(`Row ${rowNum}: Zone value is missing`);
      continue;
    }

    if (!code) {
      errors.push(`Row ${rowNum}: Country Code is missing`);
      continue;
    }

    if (!validCodes.has(code)) {
      errors.push(`Row ${rowNum}: Invalid Country Code "${code}"`);
      continue;
    }

    if (processedCountries.has(country.toUpperCase())) {
      errors.push(`Row ${rowNum}: Duplicate entry for Country "${country}" in this file`);
      continue;
    }

    processedCountries.add(country.toUpperCase());
    validRows.push({ country, code, zone });
  }

  if (errors.length > 0) {
    logSecurityEvent('INVALID_SPREADSHEET_UPLOAD', `Zones spreadsheet validation failed with ${errors.length} errors`, req.ip);
    return res.status(400).json({ 
      success: false, 
      error: 'Data validation failed. Please correct the spreadsheet.',
      errors 
    });
  }

  if (validRows.length === 0) {
    return res.status(400).json({ success: false, error: 'No valid data rows found in sheet' });
  }

  const overlaps = await db.allAsync(`
    SELECT DISTINCT effective_from, effective_to FROM international_zones
    WHERE courier = ? AND type = ? AND NOT (effective_to < ? OR effective_from > ?)
  `, [courier.toUpperCase(), type.toUpperCase(), effective_from, effective_to]);

  let overlapWarning = null;
  if (overlaps.length > 0) {
    overlapWarning = `Overlap warning: Date range overlaps with existing sheet(s) (${overlaps.map(o => `${o.effective_from} to ${o.effective_to}`).join(', ')})`;
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const sanitizedCourier = sanitizeSpreadsheetCell(courier);
    const sanitizedType = sanitizeSpreadsheetCell(type);

    db.run(
      `DELETE FROM international_zones WHERE courier = ? AND type = ? AND effective_from = ? AND effective_to = ?`,
      [sanitizedCourier.toUpperCase(), sanitizedType.toUpperCase(), effective_from, effective_to],
      (delErr) => {
        if (delErr) {
          db.run("ROLLBACK");
          return res.status(500).json({ success: false, error: 'Database clean error: ' + delErr.message });
        }
      }
    );

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO international_zones 
      (courier, country, country_code, zone, type, effective_from, effective_to, uploaded_by, uploaded_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    let count = 0;
    let dbErrors = [];

    validRows.forEach(row => {
      stmt.run(
        sanitizedCourier.toUpperCase(),
        row.country.toUpperCase(),
        row.code,
        row.zone,
        sanitizedType.toUpperCase(),
        effective_from,
        effective_to,
        'ADMIN',
        (err) => {
          if (err) dbErrors.push(err.message);
        }
      );
      count++;
    });

    stmt.finalize();

    db.run("COMMIT", (commitErr) => {
      if (commitErr) {
        db.run("ROLLBACK");
        return res.status(500).json({ success: false, error: 'Database commit failed: ' + commitErr.message });
      }

      res.json({ 
        success: true, 
        count, 
        courier, 
        effective_from, 
        effective_to,
        warning: overlapWarning 
      });
    });
  });
}));

module.exports = router;
