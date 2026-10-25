const fs = require('fs');
const path = require('path');
const db = require('./db');

const csvPath = path.join(__dirname, '..', 'DHL_rates.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const headerIdx = lines.findIndex(l => l.toLowerCase().includes('weight'));
const headers = lines[headerIdx].split(',').map(h => h.trim());

const zoneCols = [];
for (let i = 4; i < headers.length; i++) {
  if (headers[i]) {
    zoneCols.push({ idx: i, zone: headers[i].trim() });
  }
}
console.log('Zones detected:', zoneCols.map(z => z.zone));

let insertCount = 0;
db.serialize(() => {
  db.run("DELETE FROM international_rates WHERE courier = 'DHL'");
  const stmt = db.prepare(`
    INSERT INTO international_rates 
    (courier, export_import, doc_type, rate_type, from_weight, to_weight, zone, rate, fixed_perkg, effective_from, effective_to) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 5) continue;

    const expImp = (cols[0] || 'Export').toUpperCase();
    const docType = (cols[1] || 'Doc').toUpperCase() === 'DOC' ? 'DOC' : 'NON-DOC';
    const rateType = (cols[2] || 'Fixed').toUpperCase();
    const weightParts = (cols[3] || '').split('-');
    const fromWt = parseFloat(weightParts[0]) || 0;
    const toWt = parseFloat(weightParts[1]) || 0;
    const isPerKg = rateType.includes('PER') ? 1 : 0;

    for (const z of zoneCols) {
      const rate = parseFloat(cols[z.idx]);
      if (!isNaN(rate)) {
        stmt.run('DHL', expImp, docType, rateType, fromWt, toWt, z.zone, rate, isPerKg, '2000-01-01', '9999-12-31');
        insertCount++;
      }
    }
  }

  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing statement:', err);
      process.exit(1);
    }
    console.log(`Successfully inserted ${insertCount} DHL rate slabs into international_rates`);
    process.exit(0);
  });
});
