const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

const dbPath = path.resolve(__dirname, 'courier.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS international_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier TEXT,
    country TEXT,
    zone TEXT,
    type TEXT,
    UNIQUE(courier, country, type)
  )`);

  console.log("Reading Admin (2).xlsx file...");
  const xlsxPath = path.resolve(__dirname, '../Admin (2).xlsx');
  const wb = xlsx.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { range: 1 });

  console.log(`Zones to import: ${data.length}`);

  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare('INSERT OR REPLACE INTO international_zones (courier, country, zone, type) VALUES (?, ?, ?, ?)');
  
  data.forEach(row => {
    const courier = row['Courier Name'];
    const country = row['Country'];
    const zone = row['Zone'];
    const type = row['Type'];
    if (courier && country) {
        stmt.run(
            courier.toString().trim().toUpperCase(), 
            country.toString().trim().toUpperCase(), 
            zone ? zone.toString().trim().toUpperCase() : '', 
            type ? type.toString().trim().toUpperCase() : ''
        );
    }
  });

  stmt.finalize();
  db.run('COMMIT', () => {
    console.log('Import of international zones finished successfully.');
    db.close();
  });
});
