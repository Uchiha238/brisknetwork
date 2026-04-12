const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Pincode Route ---
app.get('/api/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const row = await db.getAsync('SELECT * FROM local_pincodes WHERE pincode = ?', [pincode]);
    if (row) {
      res.json({
        success: true,
        data: {
            city: row.area,
            state: row.state_desc,
            zone: row.zone
        }
      });
    } else {
      res.status(404).json({ success: false, error: 'Pincode not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Modes Routes ---
app.get('/api/modes', async (req, res) => {
  try {
    const modes = await db.allAsync('SELECT * FROM modes ORDER BY id');
    res.json(modes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/modes', async (req, res) => {
  try {
    const { name, type } = req.body;
    const result = await db.runAsync('INSERT INTO modes (name, type) VALUES (?, ?)', [name.toUpperCase(), type || 'Domestic']);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/modes/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM modes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getAsync('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Dashboard Routes ---
app.get('/api/dashboard', async (req, res) => {
  try {
    const customerCount = (await db.getAsync('SELECT count(*) as count FROM customers')).count;
    const shipmentCount = (await db.getAsync('SELECT count(*) as count FROM shipments')).count;
    const statusDistribution = await db.allAsync('SELECT status, count(*) as count FROM shipments GROUP BY status');
    
    res.json({
      totalCustomers: customerCount,
      totalShipments: shipmentCount,
      statusDistribution: statusDistribution
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Customer Routes ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.allAsync('SELECT * FROM customers');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { 
      code, name, phone, email, city, gst_no,
      password, address, staff_allotment, pincode, state,
      gst_charges, api_access, sac_code, credit_days, cft,
      domestic_rate_group, international_rate_group,
      domestic_fuel_group, international_fuel_group,
      mis_emails, mis_format
    } = req.body;
    
    const result = await db.runAsync(`
      INSERT INTO customers (
        code, name, phone, email, city, gst_no,
        password, address, staff_allotment, pincode, state,
        gst_charges, api_access, sac_code, credit_days, cft,
        domestic_rate_group, international_rate_group,
        domestic_fuel_group, international_fuel_group,
        mis_emails, mis_format
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code, name, phone, email, city, gst_no,
      password, address, staff_allotment, pincode, state,
      gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days, cft,
      domestic_rate_group, international_rate_group,
      domestic_fuel_group, international_fuel_group,
      mis_emails, mis_format
    ]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { 
      code, name, phone, email, city, gst_no,
      password, address, staff_allotment, pincode, state,
      gst_charges, api_access, sac_code, credit_days, cft,
      domestic_rate_group, international_rate_group,
      domestic_fuel_group, international_fuel_group,
      mis_emails, mis_format
    } = req.body;
    
    await db.runAsync(`
      UPDATE customers SET 
        code = ?, name = ?, phone = ?, email = ?, city = ?, gst_no = ?,
        password = ?, address = ?, staff_allotment = ?, pincode = ?, state = ?,
        gst_charges = ?, api_access = ?, sac_code = ?, credit_days = ?, cft = ?,
        domestic_rate_group = ?, international_rate_group = ?,
        domestic_fuel_group = ?, international_fuel_group = ?,
        mis_emails = ?, mis_format = ?
      WHERE id = ?
    `, [
      code, name, phone, email, city, gst_no,
      password, address, staff_allotment, pincode, state,
      gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days, cft,
      domestic_rate_group, international_rate_group,
      domestic_fuel_group, international_fuel_group,
      mis_emails, mis_format,
      req.params.id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Shipment Routes ---
app.get('/api/shipments', async (req, res) => {
  try {
    const shipments = await db.allAsync(`
      SELECT s.*, c.name as customer_name 
      FROM shipments s 
      JOIN customers c ON s.customer_id = c.id
    `);
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const { 
      customer_id, user_id, airway_no, type,
      booking_date, booking_time, product, origin_hub, origin_zone,
      destination, dest_zone, usps_number, service, duty,
      ref_no, shipment_value, currency, invoice_date, invoice_no, account_code,
      
      shipper_name, shipper_company, shipper_address1, shipper_address2, shipper_address3,
      shipper_city, shipper_state, shipper_zip, shipper_country, shipper_phone, shipper_email,
      shipper_kyc_type, shipper_kyc_no,

      consignee_name, consignee_company, consignee_address1, consignee_address2, consignee_address3,
      consignee_city, consignee_state, consignee_zip, consignee_country, consignee_phone, consignee_email,

      pcs, actual_weight, volumetric_weight, chargeable_weight,
      bill_amount, fuel_amount, gst_amount, freight_ch, total_charges,
      
      forward_no, forwarder, description, bill_type, type_of_doc, doc_number,
      destination_ch, ess_ch, oda_ch, transport_ch, clearance_ch, other_ch, ddp_ch,
      charges_date,

      packages, items 
    } = req.body;

    const result = await db.runAsync(`
      INSERT INTO shipments (
        customer_id, user_id, airway_no, type, status,
        booking_date, booking_time, product, origin_hub, origin_zone,
        destination, dest_zone, usps_number, service, duty,
        ref_no, shipment_value, currency, invoice_date, invoice_no, account_code,
        
        shipper_name, shipper_company, shipper_address1, shipper_address2, shipper_address3,
        shipper_city, shipper_state, shipper_zip, shipper_country, shipper_phone, shipper_email,
        shipper_kyc_type, shipper_kyc_no,

        consignee_name, consignee_company, consignee_address1, consignee_address2, consignee_address3,
        consignee_city, consignee_state, consignee_zip, consignee_country, consignee_phone, consignee_email,

        pcs, actual_weight, volumetric_weight, chargeable_weight,
        bill_amount, fuel_amount, gst_amount, freight_charges, total_charges,
        
        forward_no, forwarder, description, bill_type, type_of_doc, doc_number,
        destination_ch, ess_ch, oda_ch, transport_ch, clearance_ch, other_ch, ddp_ch,
        charges_date
      ) VALUES (?, ?, ?, ?, 'booked', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer_id, user_id, airway_no, type,
      booking_date, booking_time, product, origin_hub, origin_zone,
      destination, dest_zone, usps_number, service, duty,
      ref_no, shipment_value, currency, invoice_date, invoice_no, account_code,
      
      shipper_name, shipper_company, shipper_address1, shipper_address2, shipper_address3,
      shipper_city, shipper_state, shipper_zip, shipper_country, shipper_phone, shipper_email,
      shipper_kyc_type, shipper_kyc_no,

      consignee_name, consignee_company, consignee_address1, consignee_address2, consignee_address3,
      consignee_city, consignee_state, consignee_zip, consignee_country, consignee_phone, consignee_email,
      
      pcs, actual_weight, volumetric_weight, chargeable_weight,
      bill_amount, fuel_amount, gst_amount, freight_ch, total_charges,
      
      forward_no, forwarder, description, bill_type, type_of_doc, doc_number,
      destination_ch, ess_ch, oda_ch, transport_ch, clearance_ch, other_ch, ddp_ch,
      charges_date
    ]);

    const shipmentId = result.lastID;

    // Insert packages
    if (packages && packages.length > 0) {
      for (const pkg of packages) {
        await db.runAsync(`
          INSERT INTO packages (
            shipment_id, box_no, actual_wt, length, breadth, height, vol_wt, chargeable_wt, per_box_wt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [shipmentId, pkg.box_no || '1', pkg.actual_wt || 0, pkg.length || 0, pkg.breadth || 0, pkg.height || 0, pkg.vol_wt || 0, pkg.chargeable_wt || 0, pkg.per_box_wt || 0]);
      }
    }

    // Insert shipment items (invoice items)
    if (items && items.length > 0) {
      for (const item of items) {
        await db.runAsync(`
          INSERT INTO shipment_items (
            shipment_id, box_no, sr_no, description, hs_code, unit_type, quantity, unit_weight, igst, unit_rate, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [shipmentId, item.box_no || '1', item.sr_no || 1, item.description || '', item.hs_code || '', item.unit_type || 'PCS', item.quantity || 0, item.unit_weight || 0, item.igst || 0, item.unit_rate || 0, item.amount || 0]);
      }
    }

    // Auto-insert tracking row
    await db.runAsync('INSERT INTO tracking (shipment_id, status, location, event_time) VALUES (?, ?, ?, ?)', [shipmentId, 'booked', 'Origin Hub', new Date().toISOString()]);

    res.json({ success: true, id: shipmentId });
  } catch (err) {
    console.error('Shipment creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/shipments/:id/status', async (req, res) => {
  try {
    const { status, location } = req.body;
    await db.runAsync('UPDATE shipments SET status = ? WHERE id = ?', [status, req.params.id]);
    await db.runAsync('INSERT INTO tracking (shipment_id, status, location, event_time) VALUES (?, ?, ?, ?)', [req.params.id, status, location, new Date().toISOString()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shipments/:id/tracking', async (req, res) => {
  try {
    const tracking = await db.allAsync('SELECT * FROM tracking WHERE shipment_id = ? ORDER BY event_time DESC', [req.params.id]);
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Reports ---
app.get('/api/reports/export', async (req, res) => {
  try {
    const report = await db.allAsync(`
      SELECT s.*, c.name as customer_name, c.code as customer_code
      FROM shipments s
      JOIN customers c ON s.customer_id = c.id
    `);
    res.json(report);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Masters ---
app.get('/api/masters/states', async (req, res) => {
  try {
    const states = await db.allAsync('SELECT * FROM states ORDER BY name ASC');
    res.json(states);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/masters/cities', async (req, res) => {
  try {
    const { state_id } = req.query;
    const sql = state_id ? 'SELECT * FROM cities WHERE state_id = ? ORDER BY name ASC' : 'SELECT * FROM cities ORDER BY name ASC';
    const params = state_id ? [state_id] : [];
    const cities = await db.allAsync(sql, params);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/masters/countries', async (req, res) => {
  try {
    const countries = await db.allAsync('SELECT * FROM countries ORDER BY name ASC');
    res.json(countries);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Company Settings ---
app.get('/api/company', async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT * FROM company_settings ORDER BY id ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/company', async (req, res) => {
  try {
    const { company_name, logo, gst_no, email, address, pan,
      export_invoice_series, import_invoice_series, domestic_invoice_series,
      contact_no, website, branch_wise_invoice, invoice_terms,
      account_name, account_number, ifsc, branch_name, bank_name, bank_terms } = req.body;
    if (!company_name) return res.status(400).json({ success: false, error: 'Company name required' });
    const result = await db.runAsync(
      `INSERT INTO company_settings
        (company_name, logo, gst_no, email, address, pan,
         export_invoice_series, import_invoice_series, domestic_invoice_series,
         contact_no, website, branch_wise_invoice, invoice_terms,
         account_name, account_number, ifsc, branch_name, bank_name, bank_terms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, logo || null, gst_no, email, address, pan,
       export_invoice_series, import_invoice_series, domestic_invoice_series,
       contact_no, website, branch_wise_invoice ? 1 : 0, invoice_terms,
       account_name, account_number, ifsc, branch_name, bank_name, bank_terms]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/company/:id', async (req, res) => {
  try {
    const { company_name, logo, gst_no, email, address, pan,
      export_invoice_series, import_invoice_series, domestic_invoice_series,
      contact_no, website, branch_wise_invoice, invoice_terms,
      account_name, account_number, ifsc, branch_name, bank_name, bank_terms } = req.body;
    await db.runAsync(
      `UPDATE company_settings SET
        company_name=?, logo=?, gst_no=?, email=?, address=?, pan=?,
        export_invoice_series=?, import_invoice_series=?, domestic_invoice_series=?,
        contact_no=?, website=?, branch_wise_invoice=?, invoice_terms=?,
        account_name=?, account_number=?, ifsc=?, branch_name=?, bank_name=?, bank_terms=?
       WHERE id=?`,
      [company_name, logo || null, gst_no, email, address, pan,
       export_invoice_series, import_invoice_series, domestic_invoice_series,
       contact_no, website, branch_wise_invoice ? 1 : 0, invoice_terms,
       account_name, account_number, ifsc, branch_name, bank_name, bank_terms, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/company/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM company_settings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- Mail Config (SMTP) ---
app.get('/api/mail-config', async (req, res) => {
  try {
    const row = await db.getAsync('SELECT * FROM mail_config ORDER BY id ASC LIMIT 1');
    res.json(row || {});
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/mail-config', async (req, res) => {
  try {
    const { port_no, host, username, password } = req.body;
    const result = await db.runAsync(
      'INSERT INTO mail_config (port_no, host, username, password) VALUES (?, ?, ?, ?)',
      [port_no, host, username, password]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/mail-config/:id', async (req, res) => {
  try {
    const { port_no, host, username, password } = req.body;
    await db.runAsync(
      'UPDATE mail_config SET port_no=?, host=?, username=?, password=? WHERE id=?',
      [port_no, host, username, password, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- Company Branches ---
app.get('/api/branches', async (req, res) => {
  try {
    const { company_id } = req.query;
    const sql = company_id
      ? 'SELECT * FROM company_branches WHERE company_id = ? ORDER BY id ASC'
      : 'SELECT * FROM company_branches ORDER BY id ASC';
    const params = company_id ? [company_id] : [];
    res.json(await db.allAsync(sql, params));
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/branches/next-code', async (req, res) => {
  try {
    const last = await db.getAsync("SELECT branch_code FROM company_branches ORDER BY id DESC LIMIT 1");
    let next = 'BC0001';
    if (last?.branch_code) {
      const num = parseInt(last.branch_code.replace('BC', ''), 10) + 1;
      next = 'BC' + String(num).padStart(4, '0');
    }
    res.json({ code: next });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/branches', async (req, res) => {
  try {
    const { company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person } = req.body;
    if (!company_id || !branch_name) return res.status(400).json({ success: false, error: 'company_id and branch_name are required' });
    const result = await db.runAsync(
      'INSERT INTO company_branches (company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/branches/:id', async (req, res) => {
  try {
    const { branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person } = req.body;
    await db.runAsync(
      'UPDATE company_branches SET branch_name=?, branch_code=?, email=?, contact_no=?, address=?, city=?, state=?, pincode=?, contact_person=? WHERE id=?',
      [branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM company_branches WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- Fuel Entries (Detailed Add Fuel Form) ---
app.get('/api/fuel-entries', async (req, res) => {
  try {
    const entries = await db.allAsync('SELECT * FROM fuel_entries ORDER BY id DESC');
    res.json(entries.map(e => ({ ...e, rate_slabs: JSON.parse(e.rate_slabs || '[]') })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fuel-entries', async (req, res) => {
  try {
    const {
      fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
    } = req.body;
    const result = await db.runAsync(`
      INSERT INTO fuel_entries (
        fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
        fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
        fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
      JSON.stringify(rate_slabs || [])
    ]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/fuel-entries/:id', async (req, res) => {
  try {
    const {
      fuel_courier, fuel_price_pct, company_type, docket_charge, customer,
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on, cod_fixed, topay_fixed, rate_slabs
    } = req.body;
    await db.runAsync(`
      UPDATE fuel_entries SET
        fuel_courier=?, fuel_price_pct=?, company_type=?, docket_charge=?, customer=?,
        fov_min=?, fov_above=?, fov_below=?, fov_base=?, appointment_min=?, appointment_per_kg=?,
        fuel_from_date=?, fuel_to_date=?, cft=?, air_cft=?, calculate_on=?, cod_fixed=?, topay_fixed=?, rate_slabs=?
      WHERE id=?
    `, [
      fuel_courier || 'All', fuel_price_pct, company_type || 'Domestic', docket_charge, customer || 'All',
      fov_min, fov_above, fov_below, fov_base, appointment_min, appointment_per_kg,
      fuel_from_date, fuel_to_date, cft, air_cft, calculate_on || 'Freight', cod_fixed, topay_fixed,
      JSON.stringify(rate_slabs || []), req.params.id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/fuel-entries/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM fuel_entries WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/masters/rate-groups', async (req, res) => {
  try {
    const { type } = req.query;
    const sql = type ? 'SELECT * FROM rate_groups WHERE type = ?' : 'SELECT * FROM rate_groups';
    const params = type ? [type] : [];
    const groups = await db.allAsync(sql, params);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/masters/fuel-groups', async (req, res) => {
  try {
    const { type } = req.query;
    const sql = type ? 'SELECT * FROM fuel_groups WHERE type = ?' : 'SELECT * FROM fuel_groups';
    const params = type ? [type] : [];
    const groups = await db.allAsync(sql, params);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/masters/fuel-groups', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required' });
    const result = await db.runAsync('INSERT INTO fuel_groups (name, type) VALUES (?, ?)', [name.trim(), type]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'A fuel group with this name already exists.' });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/masters/fuel-groups/:id', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, error: 'Name and type are required' });
    await db.runAsync('UPDATE fuel_groups SET name = ?, type = ? WHERE id = ?', [name.trim(), type, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'A fuel group with this name already exists.' });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/masters/fuel-groups/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM fuel_groups WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
