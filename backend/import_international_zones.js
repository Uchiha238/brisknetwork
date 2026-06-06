const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'courier.db');
const db = new sqlite3.Database(dbPath);

const parseCSV = (filePath, skipRows = 0) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentVal.trim());
      lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal.trim());
    lines.push(currentLine);
  }
  
  if (lines.length <= skipRows) return [];
  
  const headers = lines[skipRows];
  const results = [];
  for (let r = skipRows + 1; r < lines.length; r++) {
    const row = lines[r];
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;
    const obj = {};
    headers.forEach((h, index) => {
      obj[h] = row[index] || '';
    });
    results.push(obj);
  }
  return results;
};

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS international_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier TEXT,
    country TEXT,
    zone TEXT,
    type TEXT,
    UNIQUE(courier, country, type)
  )`);

  console.log("Reading Admin (2).csv file...");
  const csvPath = path.resolve(__dirname, '../Admin (2).csv');
  const data = parseCSV(csvPath, 1);

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

