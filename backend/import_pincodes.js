const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./courier.db');

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
  db.run(`CREATE TABLE IF NOT EXISTS local_pincodes (
    pincode TEXT PRIMARY KEY,
    area TEXT,
    state_code TEXT,
    state_desc TEXT,
    zone TEXT
  )`);

  console.log("Reading CSV file...");
  const csvPath = path.resolve(__dirname, '../Copy of PINCODE_03062022.csv');
  const data = parseCSV(csvPath, 0);

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

