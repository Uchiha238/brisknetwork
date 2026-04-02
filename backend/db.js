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
        mis_format TEXT
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

      CREATE TABLE IF NOT EXISTS states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
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

    const shipmentInfo = await db.allAsync("PRAGMA table_info(shipments)");
    const sCols = shipmentInfo.map(c => c.name);
    if (!sCols.includes('forward_no')) await db.execAsync("ALTER TABLE shipments ADD COLUMN forward_no TEXT");
    if (!sCols.includes('forwarder')) await db.execAsync("ALTER TABLE shipments ADD COLUMN forwarder TEXT");
    if (!sCols.includes('description')) await db.execAsync("ALTER TABLE shipments ADD COLUMN description TEXT");
    if (!sCols.includes('bill_type')) await db.execAsync("ALTER TABLE shipments ADD COLUMN bill_type TEXT");
    if (!sCols.includes('type_of_doc')) await db.execAsync("ALTER TABLE shipments ADD COLUMN type_of_doc TEXT");
    if (!sCols.includes('doc_number')) await db.execAsync("ALTER TABLE shipments ADD COLUMN doc_number TEXT");
    if (!sCols.includes('destination_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN destination_ch REAL");
    if (!sCols.includes('ess_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN ess_ch REAL");
    if (!sCols.includes('oda_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN oda_ch REAL");
    if (!sCols.includes('transport_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN transport_ch REAL");
    if (!sCols.includes('clearance_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN clearance_ch REAL");
    if (!sCols.includes('other_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN other_ch REAL");
    if (!sCols.includes('ddp_ch')) await db.execAsync("ALTER TABLE shipments ADD COLUMN ddp_ch REAL");
    if (!sCols.includes('charges_date')) await db.execAsync("ALTER TABLE shipments ADD COLUMN charges_date TEXT");
    if (!sCols.includes('origin_zone')) await db.execAsync("ALTER TABLE shipments ADD COLUMN origin_zone TEXT");
    if (!sCols.includes('dest_zone')) await db.execAsync("ALTER TABLE shipments ADD COLUMN dest_zone TEXT");
    if (!sCols.includes('service')) await db.execAsync("ALTER TABLE shipments ADD COLUMN service TEXT");
    if (!sCols.includes('shipper_kyc_file1')) await db.execAsync("ALTER TABLE shipments ADD COLUMN shipper_kyc_file1 TEXT");
    if (!sCols.includes('shipper_kyc_file2')) await db.execAsync("ALTER TABLE shipments ADD COLUMN shipper_kyc_file2 TEXT");
    if (!sCols.includes('shipper_image')) await db.execAsync("ALTER TABLE shipments ADD COLUMN shipper_image TEXT");

    const packageInfo = await db.allAsync("PRAGMA table_info(packages)");
    if (!packageInfo.map(c => c.name).includes('per_box_wt')) await db.execAsync("ALTER TABLE packages ADD COLUMN per_box_wt REAL");

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
