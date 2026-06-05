const schemaSql = `
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

  CREATE TABLE IF NOT EXISTS international_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier TEXT,
    country TEXT,
    zone TEXT,
    type TEXT,
    UNIQUE(courier, country, type)
  );

  CREATE TABLE IF NOT EXISTS international_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier TEXT,
    from_weight REAL,
    to_weight REAL,
    zone TEXT,
    rate REAL,
    fixed_perkg INTEGER,
    UNIQUE(courier, to_weight, zone)
  );
`;

module.exports = schemaSql;
