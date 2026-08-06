const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ── Open / create the database ───────────────────────────────────────
// Uses plain sqlite3 (no encryption). The DB is created fresh on every
// deploy from the schema + seed data in init() below.
const dbPath = path.resolve(__dirname, 'courier.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('FATAL: Could not open database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// Enable WAL mode for better concurrent read performance
db.run('PRAGMA journal_mode = WAL');

// ── Async-compatible wrappers ─────────────────────────────────────────
// These maintain the exact same interface as before so no route files change.

db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );

db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    })
  );

db.execAsync = (sql) =>
  new Promise((resolve, reject) =>
    db.exec(sql, (err) => (err ? reject(err) : resolve()))
  );

// ── Column migration helper ───────────────────────────────────────────
const ensureColumnsExist = async (tableName, colDefinitions) => {
  try {
    const tableInfo = await db.allAsync(`PRAGMA table_info(${tableName})`);
    const existingColumns = tableInfo.map(c => c.name.toLowerCase());
    for (const [colName, colType] of Object.entries(colDefinitions)) {
      if (!existingColumns.includes(colName.toLowerCase())) {
        await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType}`);
        console.log(`Migrated ${tableName} table: added column ${colName}`);
      }
    }
  } catch (err) {
    console.error(`Failed to migrate ${tableName} table:`, err);
  }
};

// ── Initialize tables + seed data ────────────────────────────────────
const schemaSql = require('./dbSchema');
const init = async () => {
  try {
    // 1. Core Tables
    await db.execAsync(schemaSql);

    // Migration for international_rates table (date ranges + unique constraint)
    try {
      const rateTableInfo = await db.allAsync("PRAGMA table_info(international_rates)");
      const hasEffectiveFrom = rateTableInfo.some(c => c.name.toLowerCase() === 'effective_from');
      if (!hasEffectiveFrom && rateTableInfo.length > 0) {
        console.log("Migrating international_rates table to support date range...");
        await db.execAsync("ALTER TABLE international_rates RENAME TO international_rates_old");
        await db.execAsync(`
          CREATE TABLE international_rates (
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
            effective_from TEXT DEFAULT '2000-01-01',
            effective_to TEXT DEFAULT '9999-12-31',
            UNIQUE(courier, export_import, doc_type, to_weight, zone, effective_from, effective_to)
          )
        `);
        await db.execAsync(`
          INSERT INTO international_rates (courier, export_import, doc_type, rate_type, from_weight, to_weight, zone, rate, fixed_perkg, effective_from, effective_to)
          SELECT courier, export_import, doc_type, rate_type, from_weight, to_weight, zone, rate, fixed_perkg, '2000-01-01', '9999-12-31'
          FROM international_rates_old
        `);
        await db.execAsync("DROP TABLE international_rates_old");
        console.log("Migration of international_rates completed successfully.");
      }
    } catch (migErr) {
      console.error("Error migrating international_rates table:", migErr);
    }

    // Migration for international_zones table (country_code, date ranges + unique constraint)
    try {
      const zoneTableInfo = await db.allAsync("PRAGMA table_info(international_zones)");
      const hasEffectiveFromZone = zoneTableInfo.some(c => c.name.toLowerCase() === 'effective_from');
      if (!hasEffectiveFromZone && zoneTableInfo.length > 0) {
        console.log("Migrating international_zones table to support country_code and date range...");
        await db.execAsync("ALTER TABLE international_zones RENAME TO international_zones_old");
        await db.execAsync(`
          CREATE TABLE international_zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            courier TEXT,
            country TEXT,
            country_code TEXT,
            zone TEXT,
            type TEXT,
            effective_from TEXT DEFAULT '2000-01-01',
            effective_to TEXT DEFAULT '9999-12-31',
            uploaded_by TEXT DEFAULT 'ADMIN',
            uploaded_at TEXT DEFAULT (datetime('now')),
            UNIQUE(courier, country, type, effective_from, effective_to)
          )
        `);
        await db.execAsync(`
          INSERT INTO international_zones (courier, country, country_code, zone, type, effective_from, effective_to, uploaded_by, uploaded_at)
          SELECT
            courier,
            country,
            COALESCE((SELECT code FROM countries WHERE UPPER(name) = UPPER(old_z.country) LIMIT 1), 'XX'),
            zone,
            type,
            '2000-01-01',
            '9999-12-31',
            'ADMIN',
            datetime('now')
          FROM international_zones_old old_z
        `);
        await db.execAsync("DROP TABLE international_zones_old");
        console.log("Migration of international_zones completed successfully.");
      }
    } catch (migErr) {
      console.error("Error migrating international_zones table:", migErr);
    }

    // 2. Migrations for existing database
    await ensureColumnsExist('customers', {
      password: "TEXT",
      address: "TEXT",
      staff_allotment: "TEXT",
      pincode: "TEXT",
      state: "TEXT",
      gst_charges: "BOOLEAN DEFAULT 1",
      api_access: "TEXT",
      sac_code: "TEXT",
      credit_days: "INTEGER",
      cft: "TEXT",
      domestic_rate_group: "TEXT",
      international_rate_group: "TEXT",
      domestic_fuel_group: "TEXT",
      international_fuel_group: "TEXT",
      mis_emails: "TEXT",
      mis_format: "TEXT",
      customer_type: "TEXT DEFAULT 'Domestic'",
      parent_company: "TEXT",
      payment_type: "TEXT DEFAULT 'Credit'"
    });

    await ensureColumnsExist('shipments', {
      customer_id: "INTEGER",
      user_id: "INTEGER",
      airway_no: "TEXT",
      type: "TEXT",
      status: "TEXT",
      booking_date: "TEXT",
      booking_time: "TEXT",
      product: "TEXT",
      origin_hub: "TEXT",
      origin_zone: "TEXT",
      destination: "TEXT",
      dest_zone: "TEXT",
      usps_number: "TEXT",
      service: "TEXT",
      duty: "TEXT",
      ref_no: "TEXT",
      shipment_value: "REAL",
      currency: "TEXT",
      invoice_date: "TEXT",
      invoice_no: "TEXT",
      account_code: "TEXT",
      shipper_name: "TEXT",
      shipper_company: "TEXT",
      shipper_address1: "TEXT",
      shipper_address2: "TEXT",
      shipper_address3: "TEXT",
      shipper_city: "TEXT",
      shipper_state: "TEXT",
      shipper_zip: "TEXT",
      shipper_country: "TEXT",
      shipper_phone: "TEXT",
      shipper_email: "TEXT",
      shipper_kyc_type: "TEXT",
      shipper_kyc_no: "TEXT",
      consignee_name: "TEXT",
      consignee_company: "TEXT",
      consignee_address1: "TEXT",
      consignee_address2: "TEXT",
      consignee_address3: "TEXT",
      consignee_city: "TEXT",
      consignee_state: "TEXT",
      consignee_zip: "TEXT",
      consignee_country: "TEXT",
      consignee_phone: "TEXT",
      consignee_email: "TEXT",
      pcs: "INTEGER",
      actual_weight: "REAL",
      volumetric_weight: "REAL",
      chargeable_weight: "REAL",
      bill_amount: "REAL",
      fuel_amount: "REAL",
      gst_amount: "REAL",
      freight_charges: "REAL",
      total_charges: "REAL",
      forward_no: "TEXT",
      forwarder: "TEXT",
      description: "TEXT",
      bill_type: "TEXT",
      type_of_doc: "TEXT",
      doc_number: "TEXT",
      destination_ch: "REAL",
      ess_ch: "REAL",
      oda_ch: "REAL",
      transport_ch: "REAL",
      clearance_ch: "REAL",
      other_ch: "REAL",
      ddp_ch: "REAL",
      charges_date: "TEXT",
      shipper_kyc_file1: "TEXT",
      shipper_kyc_file2: "TEXT",
      shipper_image: "TEXT",
      branch: "TEXT",
      eway_bill_no: "TEXT"
    });

    await ensureColumnsExist('packages', {
      shipment_id: "INTEGER",
      box_no: "TEXT",
      actual_wt: "REAL",
      length: "REAL",
      breadth: "REAL",
      height: "REAL",
      vol_wt: "REAL",
      chargeable_wt: "REAL",
      per_box_wt: "REAL"
    });

    await ensureColumnsExist('shipment_items', {
      shipment_id: "INTEGER",
      box_no: "TEXT",
      sr_no: "INTEGER",
      description: "TEXT",
      hs_code: "TEXT",
      unit_type: "TEXT",
      quantity: "INTEGER",
      unit_weight: "REAL",
      igst: "REAL",
      unit_rate: "REAL",
      amount: "REAL"
    });

    await ensureColumnsExist('fuel_entries', {
      fuel_group_id: "INTEGER"
    });

    // 3. Seeding
    const userCount = (await db.getAsync('SELECT count(*) as count FROM users')).count;
    if (userCount === 0) {
      await db.runAsync('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
    }

    const stateCount = (await db.getAsync('SELECT count(*) as count FROM states')).count;
    if (stateCount === 0) {
      const mh = (await db.runAsync('INSERT OR IGNORE INTO states (name) VALUES (?)', ['MAHARASHTRA'])).lastID;
      const dl = (await db.runAsync('INSERT OR IGNORE INTO states (name) VALUES (?)', ['DELHI'])).lastID;
      const gj = (await db.runAsync('INSERT OR IGNORE INTO states (name) VALUES (?)', ['GUJARAT'])).lastID;

      await db.runAsync('INSERT OR IGNORE INTO cities (state_id, name) VALUES (?, ?)', [mh, 'MUMBAI']);
      await db.runAsync('INSERT OR IGNORE INTO cities (state_id, name) VALUES (?, ?)', [mh, 'PUNE']);
      await db.runAsync('INSERT OR IGNORE INTO cities (state_id, name) VALUES (?, ?)', [mh, 'THANE']);
      await db.runAsync('INSERT OR IGNORE INTO cities (state_id, name) VALUES (?, ?)', [dl, 'DELHI']);
      await db.runAsync('INSERT OR IGNORE INTO cities (state_id, name) VALUES (?, ?)', [gj, 'AHMEDABAD']);
    }

    const rgCount = (await db.getAsync('SELECT count(*) as count FROM rate_groups')).count;
    if (rgCount === 0) {
      await db.runAsync('INSERT OR IGNORE INTO rate_groups (name, type) VALUES (?, ?)', ['Domestic 1', 'domestic']);
      await db.runAsync('INSERT OR IGNORE INTO rate_groups (name, type) VALUES (?, ?)', ['CO COURIER 1', 'international']);
      await db.runAsync('INSERT OR IGNORE INTO fuel_groups (name, type) VALUES (?, ?)', ['Group A', 'domestic']);
      await db.runAsync('INSERT OR IGNORE INTO fuel_groups (name, type) VALUES (?, ?)', ['Group A', 'international']);
    }

    const countryCount = (await db.getAsync('SELECT count(*) as count FROM countries')).count;
    if (countryCount === 0) {
      const globalCountries = [
        ['INDIA', 'IN'], ['UNITED STATES', 'US'], ['UNITED KINGDOM', 'GB'], ['UNITED ARAB EMIRATES', 'AE'],
        ['CANADA', 'CA'], ['AUSTRALIA', 'AU'], ['GERMANY', 'DE'], ['FRANCE', 'FR'], ['JAPAN', 'JP'],
        ['SINGAPORE', 'SG'], ['CHINA', 'CN'], ['MALAYSIA', 'MY'], ['HONG KONG', 'HK'], ['OMAN', 'OM'],
        ['QATAR', 'QA'], ['SAUDI ARABIA', 'SA'], ['KUWAIT', 'KW'], ['BAHRAIN', 'BH'], ['SOUTH AFRICA', 'ZA']
      ];
      for (const [name, code] of globalCountries) {
        await db.runAsync('INSERT OR IGNORE INTO countries (name, code) VALUES (?, ?)', [name, code]);
      }
    }

    const modeCount = (await db.getAsync('SELECT count(*) as count FROM modes')).count;
    if (modeCount === 0) {
      const defaultModes = [['AIR', 'Both'], ['EXPRESS', 'Domestic'], ['SURFACE', 'Domestic'], ['PRIORITY', 'International']];
      for (const [name, type] of defaultModes) {
        await db.runAsync('INSERT OR IGNORE INTO modes (name, type) VALUES (?, ?)', [name, type]);
      }
    }

    await ensureColumnsExist('modes', { type: "TEXT DEFAULT 'Domestic'" });

    await ensureColumnsExist('company_settings', {
      gst_no: "TEXT",
      pan: "TEXT",
      export_invoice_series: "TEXT",
      import_invoice_series: "TEXT",
      domestic_invoice_series: "TEXT",
      website: "TEXT",
      branch_wise_invoice: "INTEGER DEFAULT 0",
      invoice_terms: "TEXT",
      account_name: "TEXT",
      account_number: "TEXT",
      ifsc: "TEXT",
      branch_name: "TEXT",
      bank_name: "TEXT",
      bank_terms: "TEXT"
    });

    const seedCompany = async (name, gst_no, email, address, pan, contact_no, website, domestic_invoice_series) => {
      const exists = await db.getAsync('SELECT id FROM company_settings WHERE company_name = ?', [name]);
      if (!exists) {
        await db.runAsync(`
          INSERT INTO company_settings
            (company_name, gst_no, email, address, pan, contact_no, website, branch_wise_invoice, domestic_invoice_series)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        `, [name, gst_no, email, address, pan, contact_no, website, domestic_invoice_series]);
      }
    };

    await seedCompany('OM COURIER SERVICES', '27AADCO1234A1Z5', 'csdomcourier@gmail.com', 'SHOP NO 1, OM DEEP SAI POOJA CHS, NEAR ALMEIDA SIGNAL, CHARAI NAKA, THANE(W)-400601', 'AADCO1234A', '9324120237', 'www.omcourier.net', 'OM/DOM/');
    await seedCompany('OM COURIER CHARAI BRANCH', '27AADCO1234A1Z5', 'charai@omcourier.net', 'SHOP NO 2, CHARAI NAKA, THANE(W)-400601', 'AADCO1234A', '9324120238', 'www.omcourier.net', 'OM/CHR/');
    await seedCompany('OM COURIER WAGLE', '27AADCO1234A1Z6', 'wagle@omcourier.net', 'WAGLE INDUSTRIAL ESTATE, THANE(W)-400604', 'AADCO1234B', '9324120239', 'www.omcourier.net', 'OM/WAG/');
    await seedCompany('SUPERJET LOGISTICS', '27ASJL5678B1Z3', 'info@superjetlogistics.com', 'OFFICE 301, EXCEL PLAZA, THANE(W)-400601', 'ASJL5678B', '9022062666', 'www.superjetlogistics.com', 'SJ/DOM/');
    await seedCompany('BRISK NETWORK', '27ABNW9012C1Z4', 'info@brisknetwork.com', 'BRISK HOUSE, MULUND WEST, MUMBAI-400080', 'ABNW9012C', '9022062667', 'www.brisknetwork.com', 'BN/DOM/');

    const custCount = (await db.getAsync('SELECT count(*) as count FROM customers')).count;
    if (custCount === 0) {
      await db.runAsync('INSERT INTO customers (code, name, phone, email, city, state, gst_no, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['CUST001', 'Global Traders', '9876543210', 'info@global.com', 'MUMBAI', 'MAHARASHTRA', '27AAAAA1234A1Z1', '123 Market St', '400001']);
      await db.runAsync('INSERT INTO customers (code, name, phone, email, city, state, gst_no, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['CUST002', 'Modern Logistics', '9123456789', 'contact@modern.com', 'DELHI', 'DELHI', '07BBBBB5678B1Z2', '45 North Ave', '110001']);
    }

    await db.runAsync(`UPDATE customers SET address = 'DEFAULT ADDRESS, OFFICE NO 101' WHERE address IS NULL OR address = ''`);
    await db.runAsync(`UPDATE customers SET pincode = '400001' WHERE pincode IS NULL OR pincode = ''`);
    await db.runAsync(`UPDATE customers SET state = 'MAHARASHTRA' WHERE state IS NULL OR state = ''`);
    await db.runAsync(`UPDATE customers SET city = 'MUMBAI' WHERE city IS NULL OR city = ''`);
    await db.runAsync(`UPDATE customers SET domestic_rate_group = 'Domestic 1' WHERE domestic_rate_group IS NULL OR domestic_rate_group = ''`);
    await db.runAsync(`UPDATE customers SET international_rate_group = 'CO COURIER 1' WHERE international_rate_group IS NULL OR international_rate_group = ''`);
    await db.runAsync(`UPDATE customers SET domestic_fuel_group = 'Group A' WHERE domestic_fuel_group IS NULL OR domestic_fuel_group = ''`);
    await db.runAsync(`UPDATE customers SET international_fuel_group = 'Group A' WHERE international_fuel_group IS NULL OR international_fuel_group = ''`);

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

init();

module.exports = db;
