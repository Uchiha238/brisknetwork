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
              rowsToInsert.push({ courier: 'DHL', country, code, zone: zone.toString().trim(), type: 'EXPORT' });
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
          rowsToInsert.push({ courier: 'FEDEX', country: country.toString().trim().toUpperCase(), code: '', zone: ipZone.toString().trim(), type: 'EXPORT' });
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
            rowsToInsert.push({ courier: 'UPS', country: country.toString().trim().toUpperCase(), code: '', zone, type: 'EXPORT' });
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
