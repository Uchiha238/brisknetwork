const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'courier.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS international_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier TEXT,
    from_weight REAL,
    to_weight REAL,
    zone TEXT,
    rate REAL,
    fixed_perkg INTEGER,
    UNIQUE(courier, to_weight, zone)
  )`);

  console.log("Reading DHL_rates.csv...");
  const csvPath = path.resolve(__dirname, '../DHL_rates.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    console.error("Empty CSV file");
    return;
  }
  
  // Parse headers by replacing the quoted first column that contains a comma
  const headerLineClean = lines[0].replace(/"[^"]*"/g, 'fixed_perkg');
  const headers = headerLineClean.split(',').map(h => h.trim());
  console.log('Headers:', headers);
  
  // Slabs start from index 3 in headers (zones 1 to 20)
  const zoneList = headers.slice(3);
  console.log('Detected Zones:', zoneList);
  
  db.run('DELETE FROM international_rates');
  
  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare(`INSERT OR REPLACE INTO international_rates 
    (courier, from_weight, to_weight, zone, rate, fixed_perkg) 
    VALUES (?, ?, ?, ?, ?, ?)`
  );
  
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 4) continue;
    
    const fixedPerKg = parseInt(cols[0], 10) || 0;
    const fromWeight = parseFloat(cols[1]) || 0;
    const toWeight = parseFloat(cols[2]) || 0;
    
    zoneList.forEach((zone, idx) => {
      const colIdx = 3 + idx;
      const rateVal = parseFloat(cols[colIdx]);
      if (!isNaN(rateVal)) {
        stmt.run('DHL', fromWeight, toWeight, zone, rateVal, fixedPerKg);
        count++;
      }
    });
  }
  
  stmt.finalize();
  db.run('COMMIT', () => {
    console.log(`Successfully imported ${count} DHL rates.`);
    db.close();
  });
});
