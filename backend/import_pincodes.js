const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

const db = new sqlite3.Database('./courier.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS local_pincodes (
    pincode TEXT PRIMARY KEY,
    area TEXT,
    state_code TEXT,
    state_desc TEXT,
    zone TEXT
  )`);

  console.log("Reading XLSB file...");
  const wb = xlsx.readFile('../Copy of PINCODE_03062022.xlsb');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

  console.log(`Pincodes to import: ${data.length}`);

  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare('INSERT OR REPLACE INTO local_pincodes (pincode, area, state_code, state_desc, zone) VALUES (?, ?, ?, ?, ?)');
  
  data.forEach(row => {
    if(row.Pincode) {
        stmt.run(row.Pincode.toString(), row.Area || '', row['State Code'] || '', row['State Description'] || '', row.ZONE ? row.ZONE.toString() : '');
    }
  });

  stmt.finalize();
  db.run('COMMIT', () => {
    console.log('Import finished.');
    db.close();
  });
});
