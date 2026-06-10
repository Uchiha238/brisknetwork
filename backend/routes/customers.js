const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');

router.get('/', asyncHandler(async (req, res) => {
  const customers = await db.allAsync('SELECT * FROM customers');
  res.json(customers);
}));

router.post('/', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['code', 'name']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { 
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges, api_access, sac_code, credit_days, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type,
    is_consignee, shipper_id
  } = req.body;

  const emailErr = validate.email(email);
  if (emailErr) return res.status(400).json({ success: false, error: emailErr });

  const phoneErr = validate.phone(phone);
  if (phoneErr) return res.status(400).json({ success: false, error: phoneErr });

  const pinErr = validate.pincode(pincode);
  if (pinErr) return res.status(400).json({ success: false, error: pinErr });

  const daysErr = validate.number(credit_days, 'credit_days');
  if (daysErr) return res.status(400).json({ success: false, error: daysErr });
  
  if (mis_emails) {
    const emailsList = mis_emails.split(';').map(e => e.trim()).filter(Boolean);
    for (const em of emailsList) {
      const emErr = validate.email(em);
      if (emErr) return res.status(400).json({ success: false, error: `MIS Email: ${emErr} for "${em}"` });
    }
  }

  const result = await db.runAsync(`
    INSERT INTO customers (
      code, name, phone, email, city, gst_no,
      password, address, staff_allotment, pincode, state,
      gst_charges, api_access, sac_code, credit_days, cft,
      domestic_rate_group, international_rate_group,
      domestic_fuel_group, international_fuel_group,
      mis_emails, mis_format, parent_company, customer_type, payment_type,
      is_consignee, shipper_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days || null, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type || 'Credit',
    is_consignee ? 1 : 0, shipper_id || null
  ]);
  res.json({ success: true, id: result.lastID });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const reqErr = validate.required(req.body, ['code', 'name']);
  if (reqErr) return res.status(400).json({ success: false, error: reqErr });

  const { 
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges, api_access, sac_code, credit_days, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type,
    is_consignee, shipper_id
  } = req.body;

  const emailErr = validate.email(email);
  if (emailErr) return res.status(400).json({ success: false, error: emailErr });

  const phoneErr = validate.phone(phone);
  if (phoneErr) return res.status(400).json({ success: false, error: phoneErr });

  const pinErr = validate.pincode(pincode);
  if (pinErr) return res.status(400).json({ success: false, error: pinErr });

  const daysErr = validate.number(credit_days, 'credit_days');
  if (daysErr) return res.status(400).json({ success: false, error: daysErr });

  if (mis_emails) {
    const emailsList = mis_emails.split(';').map(e => e.trim()).filter(Boolean);
    for (const em of emailsList) {
      const emErr = validate.email(em);
      if (emErr) return res.status(400).json({ success: false, error: `MIS Email: ${emErr} for "${em}"` });
    }
  }

  await db.runAsync(`
    UPDATE customers SET 
      code = ?, name = ?, phone = ?, email = ?, city = ?, gst_no = ?,
      password = ?, address = ?, staff_allotment = ?, pincode = ?, state = ?,
      gst_charges = ?, api_access = ?, sac_code = ?, credit_days = ?, cft = ?,
      domestic_rate_group = ?, international_rate_group = ?,
      domestic_fuel_group = ?, international_fuel_group = ?,
      mis_emails = ?, mis_format = ?, parent_company = ?, customer_type = ?, payment_type = ?,
      is_consignee = ?, shipper_id = ?
    WHERE id = ?
  `, [
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days || null, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type || 'Credit',
    is_consignee ? 1 : 0, shipper_id || null,
    req.params.id
  ]);
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM customers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
