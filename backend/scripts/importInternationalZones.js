const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

async function importZones() {
  const xlsxPath = path.resolve(__dirname, '../../INTERNATIONAL RATE 2026.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.log('File not found:', xlsxPath);
    return;
  }
  const wb = xlsx.readFile(xlsxPath);
  const rowsToInsert = [];

  // 1. DHL
  if (wb.Sheets['DHL ZONE ']) {
    const data = xlsx.utils.sheet_to_json(wb.Sheets['DHL ZONE '], { header: 1 });
    for (let r = 2; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (typeof val === 'string' && val.trim().length > 0) {
          const match = val.trim().match(/^(.*?)\s*\(([A-Z]{2})\)$/i);
          if (match) {
            const country = match[1].trim().toUpperCase();
            const code = match[2].trim().toUpperCase();
            const zone = row[c + 1];
            if (zone) {
              const zTrim = zone.toString().trim();
              rowsToInsert.push({ courier: 'DHL', country, code, zone: zTrim, type: 'EXPORT' });
              if (country === 'USA' || code === 'US') {
                rowsToInsert.push({ courier: 'DHL', country: 'UNITED STATES', code: 'US', zone: zTrim, type: 'EXPORT' });
                rowsToInsert.push({ courier: 'DHL', country: 'UNITED STATES OF AMERICA', code: 'US', zone: zTrim, type: 'EXPORT' });
              }
            }
          }
        }
      }
    }
  }

  // 2. ARAMEX
  if (wb.Sheets['ARAMEX ZONE']) {
    const data = xlsx.utils.sheet_to_json(wb.Sheets['ARAMEX ZONE'], { header: 1 });
    for (let r = 3; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      if (row[0] && row[1]) {
        rowsToInsert.push({ courier: 'ARAMEX', country: row[0].toString().trim().toUpperCase(), code: '', zone: row[1].toString().trim(), type: 'EXPORT' });
      }
      if (row[3] && row[4]) {
        rowsToInsert.push({ courier: 'ARAMEX', country: row[3].toString().trim().toUpperCase(), code: '', zone: row[4].toString().trim(), type: 'EXPORT' });
      }
    }
  }

  // 3. FEDEX
  if (wb.Sheets['FEDEX ZONE']) {
    const data = xlsx.utils.sheet_to_json(wb.Sheets['FEDEX ZONE'], { header: 1 });
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c += 5) {
        const country = row[c];
        const ipZone = row[c + 3] || row[c + 4];
        if (country && ipZone && country.toString().trim() && ipZone.toString().trim()) {
          const cUpper = country.toString().trim().toUpperCase();
          const zTrim = ipZone.toString().trim();
          rowsToInsert.push({ courier: 'FEDEX', country: cUpper, code: '', zone: zTrim, type: 'EXPORT' });
          if (cUpper.includes('U.S.A.') || cUpper.includes('REST OF COUNTRY')) {
            rowsToInsert.push({ courier: 'FEDEX', country: 'UNITED STATES', code: 'US', zone: zTrim, type: 'EXPORT' });
            rowsToInsert.push({ courier: 'FEDEX', country: 'USA', code: 'US', zone: zTrim, type: 'EXPORT' });
            rowsToInsert.push({ courier: 'FEDEX', country: 'UNITED STATES OF AMERICA', code: 'US', zone: zTrim, type: 'EXPORT' });
          }
        }
      }
    }
  }

  // 4. UPS
  if (wb.Sheets['UPS ZONE']) {
    const data = xlsx.utils.sheet_to_json(wb.Sheets['UPS ZONE'], { header: 1 });
    const headers = data[0];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const country = row[c];
        if (country && country.toString().trim()) {
          const zone = headers[c] ? headers[c].toString().replace(/^ZONE\s*/i, '').trim() : '';
          if (zone) {
            const cUpper = country.toString().trim().toUpperCase();
            const zTrim = zone.toString().trim();
            rowsToInsert.push({ courier: 'UPS', country: cUpper, code: '', zone: zTrim, type: 'EXPORT' });
            if (cUpper === 'USA') {
              rowsToInsert.push({ courier: 'UPS', country: 'UNITED STATES', code: 'US', zone: zTrim, type: 'EXPORT' });
              rowsToInsert.push({ courier: 'UPS', country: 'UNITED STATES OF AMERICA', code: 'US', zone: zTrim, type: 'EXPORT' });
            }
          }
        }
      }
    }
  }

  console.log('Total zone rows extracted:', rowsToInsert.length);

  await db.execAsync('BEGIN TRANSACTION');
  const stmt = db.prepare('INSERT OR REPLACE INTO international_zones (courier, country, country_code, zone, type, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const item of rowsToInsert) {
    stmt.run(item.courier, item.country, item.code, item.zone, item.type, '2000-01-01', '9999-12-31');
  }
  stmt.finalize();

  // Ensure USA exists in countries master table
  try {
    await db.runAsync("INSERT OR IGNORE INTO countries (name, code) VALUES ('USA', 'US')");
    await db.runAsync("INSERT OR IGNORE INTO countries (name, code) VALUES ('UNITED STATES OF AMERICA', 'US')");
  } catch (cErr) {
    console.warn('Error inserting country aliases:', cErr);
  }

  await db.execAsync('COMMIT');

  const count = await db.getAsync('SELECT count(*) as c FROM international_zones');
  console.log('Database international_zones count now:', count.c);

  const testSpain = await db.allAsync("SELECT courier, country, country_code, zone FROM international_zones WHERE country LIKE '%SPAIN%'");
  console.log('Spain zones in db:', testSpain);
}

if (require.main === module) {
  importZones()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = importZones;
