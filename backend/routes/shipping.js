const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const xlsx = require('xlsx');
const validate = require('../utils/validate');
const { logSecurityEvent } = require('../utils/logger');
const { requireAuth } = require('../utils/auth');

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

// --- International City & Country Resolution ---
const INTERNATIONAL_CITY_COUNTRY = {
  'BARCELONA': 'SPAIN',
  'MADRID': 'SPAIN',
  'VALENCIA': 'SPAIN',
  'SEVILLE': 'SPAIN',
  'BILBAO': 'SPAIN',
  'MALAGA': 'SPAIN',
  'PARIS': 'FRANCE',
  'MARSEILLE': 'FRANCE',
  'LYON': 'FRANCE',
  'NICE': 'FRANCE',
  'TOULOUSE': 'FRANCE',
  'LONDON': 'UNITED KINGDOM',
  'MANCHESTER': 'UNITED KINGDOM',
  'BIRMINGHAM': 'UNITED KINGDOM',
  'GLASGOW': 'UNITED KINGDOM',
  'EDINBURGH': 'UNITED KINGDOM',
  'LIVERPOOL': 'UNITED KINGDOM',
  'LEEDS': 'UNITED KINGDOM',
  'BRISTOL': 'UNITED KINGDOM',
  'BERLIN': 'GERMANY',
  'MUNICH': 'GERMANY',
  'FRANKFURT': 'GERMANY',
  'HAMBURG': 'GERMANY',
  'COLOGNE': 'GERMANY',
  'DUSSELDORF': 'GERMANY',
  'STUTTGART': 'GERMANY',
  'ROME': 'ITALY',
  'MILAN': 'ITALY',
  'NAPLES': 'ITALY',
  'TURIN': 'ITALY',
  'FLORENCE': 'ITALY',
  'VENICE': 'ITALY',
  'BOLOGNA': 'ITALY',
  'NEW YORK': 'UNITED STATES OF AMERICA',
  'LOS ANGELES': 'UNITED STATES OF AMERICA',
  'CHICAGO': 'UNITED STATES OF AMERICA',
  'HOUSTON': 'UNITED STATES OF AMERICA',
  'MIAMI': 'UNITED STATES OF AMERICA',
  'SAN FRANCISCO': 'UNITED STATES OF AMERICA',
  'DALLAS': 'UNITED STATES OF AMERICA',
  'WASHINGTON': 'UNITED STATES OF AMERICA',
  'BOSTON': 'UNITED STATES OF AMERICA',
  'SEATTLE': 'UNITED STATES OF AMERICA',
  'ATLANTA': 'UNITED STATES OF AMERICA',
  'TORONTO': 'CANADA',
  'VANCOUVER': 'CANADA',
  'MONTREAL': 'CANADA',
  'CALGARY': 'CANADA',
  'OTTAWA': 'CANADA',
  'EDMONTON': 'CANADA',
  'SYDNEY': 'AUSTRALIA',
  'MELBOURNE': 'AUSTRALIA',
  'BRISBANE': 'AUSTRALIA',
  'PERTH': 'AUSTRALIA',
  'ADELAIDE': 'AUSTRALIA',
  'AUCKLAND': 'NEW ZEALAND',
  'WELLINGTON': 'NEW ZEALAND',
  'CHRISTCHURCH': 'NEW ZEALAND',
  'DUBAI': 'UNITED ARAB EMIRATES',
  'ABU DHABI': 'UNITED ARAB EMIRATES',
  'SHARJAH': 'UNITED ARAB EMIRATES',
  'DOHA': 'QATAR',
  'RIYADH': 'SAUDI ARABIA',
  'JEDDAH': 'SAUDI ARABIA',
  'DAMMAM': 'SAUDI ARABIA',
  'KUWAIT CITY': 'KUWAIT',
  'KUWAIT': 'KUWAIT',
  'MANAMA': 'BAHRAIN',
  'MUSCAT': 'OMAN',
  'SINGAPORE': 'SINGAPORE',
  'HONG KONG': 'HONG KONG',
  'TOKYO': 'JAPAN',
  'OSAKA': 'JAPAN',
  'KYOTO': 'JAPAN',
  'YOKOHAMA': 'JAPAN',
  'NAGOYA': 'JAPAN',
  'SEOUL': 'SOUTH KOREA',
  'BUSAN': 'SOUTH KOREA',
  'BANGKOK': 'THAILAND',
  'PHUKET': 'THAILAND',
  'KUALA LUMPUR': 'MALAYSIA',
  'PENANG': 'MALAYSIA',
  'JAKARTA': 'INDONESIA',
  'BALI': 'INDONESIA',
  'MANILA': 'PHILIPPINES',
  'CEBU': 'PHILIPPINES',
  'HO CHI MINH': 'VIETNAM',
  'HO CHI MINH CITY': 'VIETNAM',
  'HANOI': 'VIETNAM',
  'BEIJING': 'CHINA',
  'SHANGHAI': 'CHINA',
  'SHENZHEN': 'CHINA',
  'GUANGZHOU': 'CHINA',
  'TAIPEI': 'TAIWAN',
  'AMSTERDAM': 'NETHERLANDS',
  'ROTTERDAM': 'NETHERLANDS',
  'THE HAGUE': 'NETHERLANDS',
  'BRUSSELS': 'BELGIUM',
  'ANTWERP': 'BELGIUM',
  'VIENNA': 'AUSTRIA',
  'ZURICH': 'SWITZERLAND',
  'GENEVA': 'SWITZERLAND',
  'BASEL': 'SWITZERLAND',
  'STOCKHOLM': 'SWEDEN',
  'GOTHENBURG': 'SWEDEN',
  'OSLO': 'NORWAY',
  'BERGEN': 'NORWAY',
  'COPENHAGEN': 'DENMARK',
  'HELSINKI': 'FINLAND',
  'DUBLIN': 'IRELAND',
  'CORK': 'IRELAND',
  'LISBON': 'PORTUGAL',
  'PORTO': 'PORTUGAL',
  'WARSAW': 'POLAND',
  'KRAKOW': 'POLAND',
  'PRAGUE': 'CZECH REPUBLIC',
  'BUDAPEST': 'HUNGARY',
  'BUCHAREST': 'ROMANIA',
  'ATHENS': 'GREECE',
  'THESSALONIKI': 'GREECE',
  'ISTANBUL': 'TURKEY',
  'ANKARA': 'TURKEY',
  'IZMIR': 'TURKEY',
  'CAIRO': 'EGYPT',
  'ALEXANDRIA': 'EGYPT',
  'JOHANNESBURG': 'SOUTH AFRICA',
  'CAPE TOWN': 'SOUTH AFRICA',
  'DURBAN': 'SOUTH AFRICA',
  'NAIROBI': 'KENYA',
  'MOMBASA': 'KENYA',
  'LAGOS': 'NIGERIA',
  'ACCRA': 'GHANA',
  'CASABLANCA': 'MOROCCO',
  'MARRAKECH': 'MOROCCO',
  'MEXICO CITY': 'MEXICO',
  'GUADALAJARA': 'MEXICO',
  'MONTERREY': 'MEXICO',
  'SAO PAULO': 'BRAZIL',
  'RIO DE JANEIRO': 'BRAZIL',
  'BUENOS AIRES': 'ARGENTINA',
  'SANTIAGO': 'CHILE',
  'BOGOTA': 'COLOMBIA',
  'LIMA': 'PERU',
  'COLOMBO': 'SRI LANKA',
  'DHAKA': 'BANGLADESH',
  'KATHMANDU': 'NEPAL',
  'ISLAMABAD': 'PAKISTAN',
  'KARACHI': 'PAKISTAN',
  'LAHORE': 'PAKISTAN'
};

const COUNTRY_ALIASES = {
  'USA': 'UNITED STATES',
  'UNITED STATES': 'UNITED STATES',
  'UNITED STATES OF AMERICA': 'UNITED STATES',
  'US': 'UNITED STATES',
  'U.S.': 'UNITED STATES',
  'U.S.A.': 'UNITED STATES',
  'UK': 'UNITED KINGDOM',
  'GREAT BRITAIN': 'UNITED KINGDOM',
  'ENGLAND': 'UNITED KINGDOM',
  'SCOTLAND': 'UNITED KINGDOM',
  'WALES': 'UNITED KINGDOM',
  'UAE': 'UNITED ARAB EMIRATES',
  'EMIRATES': 'UNITED ARAB EMIRATES',
  'ESPAÑA': 'SPAIN',
  'ESPANA': 'SPAIN',
  'DEUTSCHLAND': 'GERMANY',
  'ITALIA': 'ITALY',
  'FRANÇAISE': 'FRANCE',
  'FRANCAISE': 'FRANCE',
  'NEDERLAND': 'NETHERLANDS',
  'HOLLAND': 'NETHERLANDS',
  'RUSSIA': 'RUSSIAN FEDERATION',
  'SOUTH KOREA': 'KOREA, REPUBLIC OF (SOUTH KOREA)',
  'KOREA': 'KOREA, REPUBLIC OF (SOUTH KOREA)'
};

// --- International Zone Route ---
router.get('/international-zone', asyncHandler(async (req, res) => {
  const countryParam = (req.query.country || '').toString().trim();
  const cityParam = (req.query.city || '').toString().trim();
  
  if (!countryParam && !cityParam) {
    return res.status(400).json({ success: false, error: 'country or city is required' });
  }

  const courierUpper = (req.query.courier || 'DHL').toString().trim().toUpperCase();
  const typeUpper = (req.query.type || 'EXPORT').toString().trim().toUpperCase();
  const bookingDateVal = (req.query.booking_date || new Date().toISOString().split('T')[0]).toString().trim();
  
  let countryCandidate = countryParam.toUpperCase();
  const cityCandidate = cityParam.toUpperCase();

  // 1. Resolve city to country if countryCandidate is empty or happens to be a city name
  if (!countryCandidate || INTERNATIONAL_CITY_COUNTRY[countryCandidate]) {
    if (INTERNATIONAL_CITY_COUNTRY[countryCandidate]) {
      countryCandidate = INTERNATIONAL_CITY_COUNTRY[countryCandidate];
    } else if (cityCandidate && INTERNATIONAL_CITY_COUNTRY[cityCandidate]) {
      countryCandidate = INTERNATIONAL_CITY_COUNTRY[cityCandidate];
    }
  }

  // 2. Check country aliases
  if (COUNTRY_ALIASES[countryCandidate]) {
    countryCandidate = COUNTRY_ALIASES[countryCandidate];
  }

  // 3. Exact match in international_zones (by country, country_code, or US cross-alias)
  let row = await db.getAsync(
    `SELECT zone, country FROM international_zones 
     WHERE (country = ? OR country_code = ? OR (country = 'USA' AND ? = 'UNITED STATES') OR (country = 'UNITED STATES' AND ? = 'USA')) 
       AND courier = ? 
       AND (type = ? OR type IS NULL OR type = '') 
       AND (effective_from IS NULL OR effective_from = '' OR (effective_from <= ? AND effective_to >= ?)) 
     ORDER BY (country = ?) DESC, effective_from DESC LIMIT 1`,
    [countryCandidate, countryCandidate, countryCandidate, countryCandidate, courierUpper, typeUpper, bookingDateVal, bookingDateVal, countryCandidate]
  );
  
  // 4. Fuzzy match if exact match not found
  if (!row) {
    row = await db.getAsync(
      `SELECT zone, country FROM international_zones 
       WHERE (country LIKE ? OR ? LIKE "%" || country || "%" OR country_code = ?) 
         AND courier = ? 
         AND (type = ? OR type IS NULL OR type = '') 
         AND (effective_from IS NULL OR effective_from = '' OR (effective_from <= ? AND effective_to >= ?)) 
       ORDER BY effective_from DESC LIMIT 1`,
      [`%${countryCandidate}%`, countryCandidate, countryCandidate, courierUpper, typeUpper, bookingDateVal, bookingDateVal]
    );
  }

  // 5. If city is provided and country wasn't matched yet, try matching city via international city map
  if (!row && cityCandidate && INTERNATIONAL_CITY_COUNTRY[cityCandidate]) {
    const resolvedCountry = INTERNATIONAL_CITY_COUNTRY[cityCandidate];
    row = await db.getAsync(
      `SELECT zone, country FROM international_zones 
       WHERE (country = ? OR country_code = ?) 
         AND courier = ? 
         AND (type = ? OR type IS NULL OR type = '') 
         AND (effective_from IS NULL OR effective_from = '' OR (effective_from <= ? AND effective_to >= ?)) 
       ORDER BY effective_from DESC LIMIT 1`,
      [resolvedCountry, resolvedCountry, courierUpper, typeUpper, bookingDateVal, bookingDateVal]
    );
  }
  
  if (row) {
    res.json({
      success: true,
      zone: row.zone,
      country: row.country || countryCandidate,
      courier: courierUpper
    });
  } else {
    res.status(404).json({ success: false, error: 'Zone not found for the specified country/city and courier' });
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

router.post('/modes', requireAuth, asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['name']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { name, type } = req.body;
  const result = await db.runAsync('INSERT INTO modes (name, type) VALUES (?, ?)', [name.trim().toUpperCase(), type || 'Domestic']);
  res.json({ success: true, id: result.lastID });
}));

router.delete('/modes/:id', requireAuth, asyncHandler(async (req, res) => {
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
router.delete('/international-rates/groups', requireAuth, asyncHandler(async (req, res) => {
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
router.post('/international-rates/upload', requireAuth, asyncHandler(async (req, res) => {
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
router.delete('/international-zones/groups', requireAuth, asyncHandler(async (req, res) => {
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
router.post('/international-zones/upload', requireAuth, asyncHandler(async (req, res) => {
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
