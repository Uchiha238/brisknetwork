const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
    const { code, name, phone, email, city, gst_no } = req.body;
    const result = await db.runAsync('INSERT INTO customers (code, name, phone, email, city, gst_no) VALUES (?, ?, ?, ?, ?, ?)', [code, name, phone, email, city, gst_no]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { code, name, phone, email, city, gst_no } = req.body;
    await db.runAsync('UPDATE customers SET code = ?, name = ?, phone = ?, email = ?, city = ?, gst_no = ? WHERE id = ?', [code, name, phone, email, city, gst_no, req.params.id]);
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
        bill_amount, fuel_amount, gst_amount, freight_charges, total_charges
      ) VALUES (?, ?, ?, ?, 'booked', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      bill_amount, fuel_amount, gst_amount, freight_ch, total_charges
    ]);

    const shipmentId = result.lastID;

    // Insert packages
    if (packages && packages.length > 0) {
      for (const pkg of packages) {
        await db.runAsync(`
          INSERT INTO packages (
            shipment_id, box_no, actual_wt, length, breadth, height, vol_wt, chargeable_wt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [shipmentId, pkg.box_no || '1', pkg.actual_wt || 0, pkg.length || 0, pkg.breadth || 0, pkg.height || 0, pkg.vol_wt || 0, pkg.chargeable_wt || 0]);
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
