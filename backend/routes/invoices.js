const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

// 1. Get all generated invoices
router.get('/', asyncHandler(async (req, res) => {
  const invoices = await db.allAsync(`
    SELECT i.*, c.name as customer_name, c.city as customer_city, c.gst_no as customer_gst, c.code as customer_code
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.id DESC
  `);
  res.json(invoices);
}));

// 2. Get unbilled shipments for invoice generation
router.get('/unbilled-shipments', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.query, ['customer_id', 'from_date', 'to_date', 'invoice_type']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const numErr = validate.number(req.query.customer_id, 'customer_id');
  if (numErr) return res.status(400).json({ success: false, error: numErr });

  const { customer_id, from_date, to_date, invoice_type } = req.query;

  let sql = `
    SELECT s.* 
    FROM shipments s
    WHERE s.customer_id = ? 
      AND s.invoice_id IS NULL
      AND s.booking_date BETWEEN ? AND ?
  `;
  const params = [customer_id, from_date, to_date];

  if (invoice_type === 'Export') {
    sql += " AND UPPER(s.type) = 'INTERNATIONAL' AND (s.mode IS NULL OR TRIM(s.mode) = '' OR TRIM(UPPER(s.mode)) != 'IMPORT')";
  } else if (invoice_type === 'Import') {
    sql += " AND UPPER(s.type) = 'INTERNATIONAL' AND TRIM(UPPER(s.mode)) = 'IMPORT'";
  } else {
    // Domestic
    sql += " AND UPPER(s.type) = 'DOMESTIC'";
  }

  sql += " ORDER BY s.booking_date ASC, s.airway_no ASC";

  const shipments = await db.allAsync(sql, params);
  res.json(shipments);
}));

// 3. Create a new billing invoice
router.post('/', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['customer_id', 'from_date', 'to_date', 'invoice_type', 'invoice_date']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const numErr = validate.number(req.body.customer_id, 'customer_id');
  if (numErr) return res.status(400).json({ success: false, error: numErr });

  const { customer_id, from_date, to_date, invoice_type, invoice_date } = req.body;

  // A. Fetch customer to check GST applicability and state
  const customer = await db.getAsync("SELECT * FROM customers WHERE id = ?", [customer_id]);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // B. Fetch company details (booking company)
  const company = await db.getAsync("SELECT * FROM company_settings LIMIT 1");
  const companyState = company ? (company.state || 'MAHARASHTRA').trim().toUpperCase() : 'MAHARASHTRA';
  const custState = (customer.state || '').trim().toUpperCase();

  // C. Find unbilled shipments
  let sql = `
    SELECT s.* 
    FROM shipments s
    WHERE s.customer_id = ? 
      AND s.invoice_id IS NULL
      AND s.booking_date BETWEEN ? AND ?
  `;
  const params = [customer_id, from_date, to_date];

  if (invoice_type === 'Export') {
    sql += " AND UPPER(s.type) = 'INTERNATIONAL' AND (s.mode IS NULL OR TRIM(s.mode) = '' OR TRIM(UPPER(s.mode)) != 'IMPORT')";
  } else if (invoice_type === 'Import') {
    sql += " AND UPPER(s.type) = 'INTERNATIONAL' AND TRIM(UPPER(s.mode)) = 'IMPORT'";
  } else {
    sql += " AND UPPER(s.type) = 'DOMESTIC'";
  }

  const shipments = await db.allAsync(sql, params);
  if (shipments.length === 0) {
    return res.status(400).json({ error: 'No unbilled shipments found in this date range.' });
  }

  // D. Calculate totals
  let subTotal = 0;
  shipments.forEach(s => {
    // subtotal per AWB = freight_charges + ess_ch + fuel_amount (or total subtotal of this shipment)
    // In our database, shipments has individual charges. Let's sum freight_charges, ess_ch, and fuel_amount,
    // plus any other applicable charges (e.g. pickup, transport, clearance, remote area, etc.).
    // To match the sample bill where subtotal = Freight + ESS + Fuel, let's sum:
    const awbSub = (s.freight_charges || 0) + (s.ess_ch || 0) + (s.fuel_amount || 0) + (s.pickup_ch || 0) + 
                   (s.transport_ch || 0) + (s.clearance_ch || 0) + (s.oda_ch || 0) + (s.other_ch || 0) + (s.ddp_ch || 0);
    subTotal += awbSub;
  });

  // E. Calculate taxes (CGST/SGST if intra-state, IGST if inter-state)
  const isGstApplicable = customer.gst_charges === undefined || customer.gst_charges === 'Yes' || customer.gst_charges === 1 || customer.gst_charges === true;
  let cgst = 0, sgst = 0, igst = 0;

  if (isGstApplicable) {
    const isSameState = custState === companyState || custState.includes('MAHARASHTRA') || custState === '';
    if (isSameState) {
      cgst = parseFloat((subTotal * 0.09).toFixed(2));
      sgst = parseFloat((subTotal * 0.09).toFixed(2));
    } else {
      igst = parseFloat((subTotal * 0.18).toFixed(2));
    }
  }

  const exactGrandTotal = subTotal + cgst + sgst + igst;
  const grandTotal = Math.round(exactGrandTotal);

  // F. Generate sequential invoice number
  // Format: PREFIX/sequential_number (e.g., OMEXP/26-27/2345)
  let prefix = 'OMEXP/26-27/';
  if (company) {
    if (invoice_type === 'Export') {
      prefix = company.export_invoice_series || 'OMEXP/26-27/';
    } else if (invoice_type === 'Import') {
      prefix = company.import_invoice_series || 'OMIMP/26-27/';
    } else {
      prefix = company.domestic_invoice_series || 'OMDOM/26-27/';
    }
  }

  // Find last invoice with this prefix
  const lastInvoice = await db.getAsync(
    "SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1",
    [`${prefix}%`]
  );

  let nextNum = 2345; // default start matching the sample
  if (lastInvoice) {
    const lastNumStr = lastInvoice.invoice_number.replace(prefix, '');
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  const invoiceNumber = `${prefix}${nextNum}`;

  db.serialize(async () => {
    db.run("BEGIN TRANSACTION");
    try {
      // G. Insert invoice record
      const result = await db.runAsync(`
        INSERT INTO invoices (
          invoice_number, invoice_date, customer_id, from_date, to_date,
          invoice_type, sub_total, cgst, sgst, igst, grand_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceNumber, invoice_date, customer_id, from_date, to_date,
        invoice_type, subTotal, cgst, sgst, igst, grandTotal
      ]);

      const invoiceId = result.lastID;

      // H. Update shipments to reference this invoice
      for (const s of shipments) {
        await db.runAsync("UPDATE shipments SET invoice_id = ? WHERE id = ?", [invoiceId, s.id]);
      }

      db.run("COMMIT", () => {
        res.json({ success: true, id: invoiceId, invoice_number: invoiceNumber });
      });
    } catch (err) {
      db.run("ROLLBACK");
      res.status(500).json({ error: 'Failed to generate invoice: ' + err.message });
    }
  });
}));

// 4. Get invoice details and associated shipments for rendering/printing
router.get('/:id', asyncHandler(async (req, res) => {
  const invoice = await db.getAsync(`
    SELECT i.*, c.name as customer_name, c.address as customer_address, c.city as customer_city, 
           c.state as customer_state, c.pincode as customer_pincode, c.gst_no as customer_gst, c.code as customer_code
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `, [req.params.id]);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  // Fetch company details
  const company = await db.getAsync("SELECT * FROM company_settings LIMIT 1");

  // Fetch shipments
  const shipments = await db.allAsync(`
    SELECT * FROM shipments WHERE invoice_id = ? ORDER BY booking_date ASC, airway_no ASC
  `, [req.params.id]);

  res.json({
    success: true,
    invoice,
    company,
    shipments
  });
}));

// 5. Delete invoice and release shipments
router.delete('/:id', asyncHandler(async (req, res) => {
  db.serialize(async () => {
    db.run("BEGIN TRANSACTION");
    try {
      // Release shipments
      await db.runAsync("UPDATE shipments SET invoice_id = NULL WHERE invoice_id = ?", [req.params.id]);
      // Delete invoice
      await db.runAsync("DELETE FROM invoices WHERE id = ?", [req.params.id]);
      
      db.run("COMMIT", () => {
        res.json({ success: true });
      });
    } catch (err) {
      db.run("ROLLBACK");
      res.status(500).json({ error: 'Failed to delete invoice: ' + err.message });
    }
  });
}));

module.exports = router;
