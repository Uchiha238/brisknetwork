const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'courier.db');
const db = new sqlite3.Database(dbPath);

// Helper for Promisified queries
db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.execAsync = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Initialize tables
const init = async () => {
  try {
    // 1. Core Tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        name TEXT,
        phone TEXT,
        email TEXT,
        city TEXT,
        gst_no TEXT,
        password TEXT,
        address TEXT,
        staff_allotment TEXT,
        pincode TEXT,
        state TEXT,
        gst_charges BOOLEAN DEFAULT 1,
        api_access TEXT,
        sac_code TEXT,
        credit_days INTEGER,
        cft TEXT,
        domestic_rate_group TEXT,
        international_rate_group TEXT,
        domestic_fuel_group TEXT,
        international_fuel_group TEXT,
        mis_emails TEXT,
        mis_format TEXT,
        payment_type TEXT DEFAULT 'Credit'
      );

      CREATE TABLE IF NOT EXISTS rate_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        type TEXT
      );

      CREATE TABLE IF NOT EXISTS fuel_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        type TEXT
      );

      CREATE TABLE IF NOT EXISTS fuel_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fuel_courier TEXT DEFAULT 'All',
        fuel_price_pct REAL,
        company_type TEXT DEFAULT 'Domestic',
        docket_charge REAL,
        customer TEXT DEFAULT 'All',
        fov_min REAL,
        fov_above REAL,
        fov_below REAL,
        fov_base REAL,
        appointment_min REAL,
        appointment_per_kg REAL,
        fuel_from_date TEXT,
        fuel_to_date TEXT,
        cft REAL,
        air_cft REAL,
        calculate_on TEXT DEFAULT 'Freight',
        cod_fixed REAL,
        topay_fixed REAL,
        rate_slabs TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        logo TEXT,
        gst_no TEXT,
        email TEXT,
        address TEXT,
        pan TEXT,
        export_invoice_series TEXT,
        import_invoice_series TEXT,
        domestic_invoice_series TEXT,
        contact_no TEXT,
        website TEXT,
        branch_wise_invoice INTEGER DEFAULT 0,
        invoice_terms TEXT,
        account_name TEXT,
        account_number TEXT,
        ifsc TEXT,
        branch_name TEXT,
        bank_name TEXT,
        bank_terms TEXT
      );

      CREATE TABLE IF NOT EXISTS mail_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        port_no TEXT,
        host TEXT,
        username TEXT,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS company_branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        branch_name TEXT NOT NULL,
        branch_code TEXT UNIQUE,
        email TEXT,
        contact_no TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        contact_person TEXT,
        FOREIGN KEY (company_id) REFERENCES company_settings(id)
      );

      CREATE TABLE IF NOT EXISTS states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      );

      CREATE TABLE IF NOT EXISTS modes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        type TEXT DEFAULT 'Domestic'
      );

      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state_id INTEGER,
        name TEXT UNIQUE,
        FOREIGN KEY (state_id) REFERENCES states(id)
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        user_id INTEGER,
        airway_no TEXT UNIQUE,
        type TEXT, 
        status TEXT,
        booking_date TEXT,
        booking_time TEXT,
        product TEXT,
        origin_hub TEXT,
        origin_zone TEXT,
        destination TEXT,
        dest_zone TEXT,
        usps_number TEXT,
        service TEXT,
        duty TEXT,
        ref_no TEXT,
        shipment_value REAL,
        currency TEXT,
        invoice_date TEXT,
        invoice_no TEXT,
        account_code TEXT,
        shipper_name TEXT,
        shipper_company TEXT,
        shipper_address1 TEXT,
        shipper_address2 TEXT,
        shipper_address3 TEXT,
        shipper_city TEXT,
        shipper_state TEXT,
        shipper_zip TEXT,
        shipper_country TEXT,
        shipper_phone TEXT,
        shipper_email TEXT,
        shipper_kyc_type TEXT,
        shipper_kyc_no TEXT,
        consignee_name TEXT,
        consignee_company TEXT,
        consignee_address1 TEXT,
        consignee_address2 TEXT,
        consignee_address3 TEXT,
        consignee_city TEXT,
        consignee_state TEXT,
        consignee_zip TEXT,
        consignee_country TEXT,
        consignee_phone TEXT,
        consignee_email TEXT,
        pcs INTEGER,
        actual_weight REAL,
        volumetric_weight REAL,
        chargeable_weight REAL,
        bill_amount REAL,
        fuel_amount REAL,
        gst_amount REAL,
        freight_charges REAL,
        total_charges REAL,
        forward_no TEXT,
        forwarder TEXT,
        description TEXT,
        bill_type TEXT,
        type_of_doc TEXT,
        doc_number TEXT,
        destination_ch REAL,
        ess_ch REAL,
        oda_ch REAL,
        transport_ch REAL,
        clearance_ch REAL,
        other_ch REAL,
        ddp_ch REAL,
        charges_date TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        box_no TEXT,
        actual_wt REAL,
        length REAL,
        breadth REAL,
        height REAL,
        vol_wt REAL,
        chargeable_wt REAL,
        per_box_wt REAL,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id)
      );

      CREATE TABLE IF NOT EXISTS shipment_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        box_no TEXT,
        sr_no INTEGER,
        description TEXT,
        hs_code TEXT,
        unit_type TEXT,
        quantity INTEGER,
        unit_weight REAL,
        igst REAL,
        unit_rate REAL,
        amount REAL,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id)
      );

      CREATE TABLE IF NOT EXISTS tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER,
        status TEXT,
        location TEXT,
        event_time TEXT,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id)
      );

      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        code TEXT UNIQUE
      );
    `);

    // 2. Migrations for existing database
    const tableInfo = await db.allAsync("PRAGMA table_info(customers)");
    const columns = tableInfo.map(c => c.name);
    
    if (!columns.includes('password')) await db.execAsync("ALTER TABLE customers ADD COLUMN password TEXT");
    if (!columns.includes('address')) await db.execAsync("ALTER TABLE customers ADD COLUMN address TEXT");
    if (!columns.includes('staff_allotment')) await db.execAsync("ALTER TABLE customers ADD COLUMN staff_allotment TEXT");
    if (!columns.includes('pincode')) await db.execAsync("ALTER TABLE customers ADD COLUMN pincode TEXT");
    if (!columns.includes('state')) await db.execAsync("ALTER TABLE customers ADD COLUMN state TEXT");
    if (!columns.includes('gst_charges')) await db.execAsync("ALTER TABLE customers ADD COLUMN gst_charges BOOLEAN DEFAULT 1");
    if (!columns.includes('api_access')) await db.execAsync("ALTER TABLE customers ADD COLUMN api_access TEXT");
    if (!columns.includes('sac_code')) await db.execAsync("ALTER TABLE customers ADD COLUMN sac_code TEXT");
    if (!columns.includes('credit_days')) await db.execAsync("ALTER TABLE customers ADD COLUMN credit_days INTEGER");
    if (!columns.includes('cft')) await db.execAsync("ALTER TABLE customers ADD COLUMN cft TEXT");
    if (!columns.includes('domestic_rate_group')) await db.execAsync("ALTER TABLE customers ADD COLUMN domestic_rate_group TEXT");
    if (!columns.includes('international_rate_group')) await db.execAsync("ALTER TABLE customers ADD COLUMN international_rate_group TEXT");
    if (!columns.includes('domestic_fuel_group')) await db.execAsync("ALTER TABLE customers ADD COLUMN domestic_fuel_group TEXT");
    if (!columns.includes('international_fuel_group')) await db.execAsync("ALTER TABLE customers ADD COLUMN international_fuel_group TEXT");
    if (!columns.includes('mis_emails')) await db.execAsync("ALTER TABLE customers ADD COLUMN mis_emails TEXT");
    if (!columns.includes('mis_format')) await db.execAsync("ALTER TABLE customers ADD COLUMN mis_format TEXT");
    if (!columns.includes('customer_type')) await db.execAsync("ALTER TABLE customers ADD COLUMN customer_type TEXT DEFAULT 'Domestic'");
    if (!columns.includes('parent_company')) await db.execAsync("ALTER TABLE customers ADD COLUMN parent_company TEXT");
    if (!columns.includes('payment_type')) await db.execAsync("ALTER TABLE customers ADD COLUMN payment_type TEXT DEFAULT 'Credit'");

    const shipmentInfo = await db.allAsync("PRAGMA table_info(shipments)");
    const sCols = shipmentInfo.map(c => c.name);
    
    const expectedShipmentCols = {
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
    };

    for (const [colName, colType] of Object.entries(expectedShipmentCols)) {
      if (!sCols.includes(colName)) {
        try {
          await db.execAsync(`ALTER TABLE shipments ADD COLUMN ${colName} ${colType}`);
          console.log(`Migrated shipments table: added column ${colName}`);
        } catch (alterErr) {
          console.error(`Failed to add column ${colName} to shipments table:`, alterErr);
        }
      }
    }

    const packageInfo = await db.allAsync("PRAGMA table_info(packages)");
    const pCols = packageInfo.map(c => c.name);
    const expectedPackageCols = {
      shipment_id: "INTEGER",
      box_no: "TEXT",
      actual_wt: "REAL",
      length: "REAL",
      breadth: "REAL",
      height: "REAL",
      vol_wt: "REAL",
      chargeable_wt: "REAL",
      per_box_wt: "REAL"
    };
    for (const [colName, colType] of Object.entries(expectedPackageCols)) {
      if (!pCols.includes(colName)) {
        try {
          await db.execAsync(`ALTER TABLE packages ADD COLUMN ${colName} ${colType}`);
          console.log(`Migrated packages table: added column ${colName}`);
        } catch (alterErr) {
          console.error(`Failed to add column ${colName} to packages table:`, alterErr);
        }
      }
    }

    const itemInfo = await db.allAsync("PRAGMA table_info(shipment_items)");
    const iCols = itemInfo.map(c => c.name);
    const expectedItemCols = {
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
    };
    for (const [colName, colType] of Object.entries(expectedItemCols)) {
      if (!iCols.includes(colName)) {
        try {
          await db.execAsync(`ALTER TABLE shipment_items ADD COLUMN ${colName} ${colType}`);
          console.log(`Migrated shipment_items table: added column ${colName}`);
        } catch (alterErr) {
          console.error(`Failed to add column ${colName} to shipment_items table:`, alterErr);
        }
      }
    }

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

    // Migrate modes table — add type column if missing
    const modeInfo = await db.allAsync("PRAGMA table_info(modes)");
    if (!modeInfo.map(c => c.name).includes('type')) {
      await db.execAsync("ALTER TABLE modes ADD COLUMN type TEXT DEFAULT 'Domestic'");
    }

    // Migrate company_settings columns if table already existed with fewer columns
    const companyInfo = await db.allAsync("PRAGMA table_info(company_settings)");
    const cCols = companyInfo.map(c => c.name);
    if (!cCols.includes('gst_no')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN gst_no TEXT");
    if (!cCols.includes('pan')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN pan TEXT");
    if (!cCols.includes('export_invoice_series')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN export_invoice_series TEXT");
    if (!cCols.includes('import_invoice_series')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN import_invoice_series TEXT");
    if (!cCols.includes('domestic_invoice_series')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN domestic_invoice_series TEXT");
    if (!cCols.includes('website')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN website TEXT");
    if (!cCols.includes('branch_wise_invoice')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN branch_wise_invoice INTEGER DEFAULT 0");
    if (!cCols.includes('invoice_terms')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN invoice_terms TEXT");
    if (!cCols.includes('account_name')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN account_name TEXT");
    if (!cCols.includes('account_number')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN account_number TEXT");
    if (!cCols.includes('ifsc')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN ifsc TEXT");
    if (!cCols.includes('branch_name')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN branch_name TEXT");
    if (!cCols.includes('bank_name')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN bank_name TEXT");
    if (!cCols.includes('bank_terms')) await db.execAsync("ALTER TABLE company_settings ADD COLUMN bank_terms TEXT");

    // Seed default companies (idempotent — uses name check)
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

    await seedCompany(
      'OM COURIER SERVICES',
      '27AADCO1234A1Z5', 'csdomcourier@gmail.com',
      'SHOP NO 1, OM DEEP SAI POOJA CHS, NEAR ALMEIDA SIGNAL, CHARAI NAKA, THANE(W)-400601',
      'AADCO1234A', '9324120237', 'www.omcourier.net', 'OM/DOM/'
    );
    await seedCompany(
      'OM COURIER CHARAI BRANCH',
      '27AADCO1234A1Z5', 'charai@omcourier.net',
      'SHOP NO 2, CHARAI NAKA, THANE(W)-400601',
      'AADCO1234A', '9324120238', 'www.omcourier.net', 'OM/CHR/'
    );
    await seedCompany(
      'OM COURIER WAGLE',
      '27AADCO1234A1Z6', 'wagle@omcourier.net',
      'WAGLE INDUSTRIAL ESTATE, THANE(W)-400604',
      'AADCO1234B', '9324120239', 'www.omcourier.net', 'OM/WAG/'
    );
    await seedCompany(
      'SUPERJET LOGISTICS',
      '27ASJL5678B1Z3', 'info@superjetlogistics.com',
      'OFFICE 301, EXCEL PLAZA, THANE(W)-400601',
      'ASJL5678B', '9022062666', 'www.superjetlogistics.com', 'SJ/DOM/'
    );
    await seedCompany(
      'BRISK NETWORK',
      '27ABNW9012C1Z4', 'info@brisknetwork.com',
      'BRISK HOUSE, MULUND WEST, MUMBAI-400080',
      'ABNW9012C', '9022062667', 'www.brisknetwork.com', 'BN/DOM/'
    );


    const custCount = (await db.getAsync('SELECT count(*) as count FROM customers')).count;
    if (custCount === 0) {
      await db.runAsync('INSERT INTO customers (code, name, phone, email, city, state, gst_no, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['CUST001', 'Global Traders', '9876543210', 'info@global.com', 'MUMBAI', 'MAHARASHTRA', '27AAAAA1234A1Z1', '123 Market St', '400001']);
      await db.runAsync('INSERT INTO customers (code, name, phone, email, city, state, gst_no, address, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['CUST002', 'Modern Logistics', '9123456789', 'contact@modern.com', 'DELHI', 'DELHI', '07BBBBB5678B1Z2', '45 North Ave', '110001']);
    }

    // Migration for existing empty records (like TST001)
    await db.runAsync(`
      UPDATE customers 
      SET address = 'DEFAULT ADDRESS, OFFICE NO 101' WHERE address IS NULL OR address = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET pincode = '400001' WHERE pincode IS NULL OR pincode = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET state = 'MAHARASHTRA' WHERE state IS NULL OR state = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET city = 'MUMBAI' WHERE city IS NULL OR city = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET domestic_rate_group = 'Domestic 1' WHERE domestic_rate_group IS NULL OR domestic_rate_group = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET international_rate_group = 'CO COURIER 1' WHERE international_rate_group IS NULL OR international_rate_group = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET domestic_fuel_group = 'Group A' WHERE domestic_fuel_group IS NULL OR domestic_fuel_group = '';
    `);
    await db.runAsync(`
      UPDATE customers 
      SET international_fuel_group = 'Group A' WHERE international_fuel_group IS NULL OR international_fuel_group = '';
    `);

  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

init();

module.exports = db;
