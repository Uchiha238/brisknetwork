const db = require('./db');

async function migrate() {
  try {
    console.log("Creating invoices table...");
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE,
        invoice_date TEXT,
        customer_id INTEGER,
        from_date TEXT,
        to_date TEXT,
        invoice_type TEXT,
        sub_total REAL,
        cgst REAL,
        sgst REAL,
        igst REAL,
        grand_total REAL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    console.log("Checking columns in shipments table...");
    const columns = await db.allAsync("PRAGMA table_info(shipments)");
    const hasInvoiceId = columns.some(c => c.name === 'invoice_id');

    if (!hasInvoiceId) {
      console.log("Adding invoice_id column to shipments table...");
      await db.runAsync("ALTER TABLE shipments ADD COLUMN invoice_id INTEGER");
    } else {
      console.log("invoice_id column already exists in shipments table.");
    }

    const hasMode = columns.some(c => c.name === 'mode');
    if (!hasMode) {
      console.log("Adding mode column to shipments table...");
      await db.runAsync("ALTER TABLE shipments ADD COLUMN mode TEXT");
    } else {
      console.log("mode column already exists in shipments table.");
    }

    console.log("Invoice database migration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
