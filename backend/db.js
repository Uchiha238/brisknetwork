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
      gst_no TEXT
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
      
      -- Shipper details
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

      -- Consignee details
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

      -- Weights and Billing
      pcs INTEGER,
      actual_weight REAL,
      volumetric_weight REAL,
      chargeable_weight REAL,
      bill_amount REAL,
      fuel_amount REAL,
      gst_amount REAL,
      freight_charges REAL,
      total_charges REAL,

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

  // Seed data if empty
  const userCount = (await db.getAsync('SELECT count(*) as count FROM users')).count;
  if (userCount === 0) {
    await db.runAsync('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
    
    await db.runAsync('INSERT INTO customers (code, name, phone, email, city, gst_no) VALUES (?, ?, ?, ?, ?, ?)', ['CUST001', 'Global Traders', '9876543210', 'info@global.com', 'Mumbai', '27AAAAA1234A1Z1']);
    await db.runAsync('INSERT INTO customers (code, name, phone, email, city, gst_no) VALUES (?, ?, ?, ?, ?, ?)', ['CUST002', 'Modern Logistics', '9123456789', 'contact@modern.com', 'Delhi', '07BBBBB5678B1Z2']);
    await db.runAsync('INSERT INTO customers (code, name, phone, email, city, gst_no) VALUES (?, ?, ?, ?, ?, ?)', ['CUST003', 'SVP Infotech', '9022062666', 'info@svpinfotech.com', 'Thane', '27CCCCC9012C1Z3']);

    await db.runAsync(`
      INSERT INTO shipments (
        customer_id, user_id, airway_no, type, status, 
        consignee_name, consignee_city, consignee_country, 
        booking_date, freight_charges, total_charges
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [1, 1, 'AWB1001', 'international', 'booked', 'John Doe', 'New York', 'USA', '2026-03-22', 1500, 1800]);

    await db.runAsync(`
      INSERT INTO shipments (
        customer_id, user_id, airway_no, type, status, 
        consignee_name, consignee_city, consignee_country, 
        booking_date, freight_charges, total_charges
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [2, 1, 'AWB1002', 'domestic', 'in_transit', 'Jane Smith', 'Bangalore', 'India', '2026-03-22', 500, 600]);
    
    await db.runAsync('INSERT INTO tracking (shipment_id, status, location, event_time) VALUES (?, ?, ?, ?)', [2, 'booked', 'Mumbai Hub', '2026-03-22 10:00:00']);
  }
};

init().catch(console.error);

module.exports = db;
