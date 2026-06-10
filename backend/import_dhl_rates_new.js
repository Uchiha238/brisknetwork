const fs = require('fs');
const path = require('path');
const db = require('./db');

const csvPath = path.resolve(__dirname, '../DHL_Rates.csv');

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
  
  return lines;
};

async function run() {
  console.log("Reading DHL_Rates.csv...");
  const allLines = parseCSV(csvPath);
  if (allLines.length < 2) {
    console.error("Invalid CSV structure or empty file");
    process.exit(1);
  }
  
  // Line index 1 has headers (e.g. Export/Import, Doc/Non Doc, Rate Type, Weight, 1, 2, ...)
  const headers = allLines[1];
  console.log("Headers:", headers);
  
  // Zones start from index 4 in headers (1, 2, 3, ...)
  const zones = headers.slice(4);
  console.log("Zones detected:", zones);
  
  db.serialize(async () => {
    // Drop and recreate table with the correct schema
    db.run("DROP TABLE IF EXISTS international_rates");
    db.run(`CREATE TABLE IF NOT EXISTS international_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courier TEXT,
      export_import TEXT,
      doc_type TEXT,
      rate_type TEXT,
      from_weight REAL,
      to_weight REAL,
      zone TEXT,
      rate REAL,
      fixed_perkg INTEGER,
      UNIQUE(courier, export_import, doc_type, to_weight, zone)
    )`);
    
    db.run("BEGIN TRANSACTION");
    
    const stmt = db.prepare(`INSERT OR REPLACE INTO international_rates 
      (courier, export_import, doc_type, rate_type, from_weight, to_weight, zone, rate, fixed_perkg) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    let count = 0;
    // Data rows start from index 2
    for (let i = 2; i < allLines.length; i++) {
      const cols = allLines[i];
      if (cols.length < 5) continue;
      
      const exportImport = (cols[0] || '').trim().toUpperCase(); // EXPORT or IMPORT
      const docType = (cols[1] || '').trim().toUpperCase();       // DOC or NON-DOC
      const rateType = (cols[2] || '').trim().toUpperCase();      // FIXED or PER KG
      const weightRange = (cols[3] || '').trim();
      
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
      
      const fixedPerKg = rateType.includes('PER KG') || rateType.includes('PER_KG') ? 1 : 0;
      
      zones.forEach((zone, idx) => {
        const colIdx = 4 + idx;
        const rateVal = parseFloat(cols[colIdx]);
        if (!isNaN(rateVal)) {
          stmt.run('DHL', exportImport, docType, rateType, fromWeight, toWeight, zone, rateVal, fixedPerKg);
          count++;
        }
      });
    }
    
    stmt.finalize();
    db.run("COMMIT", (err) => {
      if (err) {
        console.error("Error committing transaction:", err);
      } else {
        console.log(`Successfully imported ${count} international rates for DHL.`);
      }
      process.exit(0);
    });
  });
}

run();
