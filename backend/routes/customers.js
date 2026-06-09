const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const customers = await db.allAsync('SELECT * FROM customers');
  res.json(customers);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { 
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges, api_access, sac_code, credit_days, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type,
    is_consignee, shipper_id
  } = req.body;
  
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
    gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type || 'Credit',
    is_consignee ? 1 : 0, shipper_id || null
  ]);
  res.json({ success: true, id: result.lastID });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { 
    code, name, phone, email, city, gst_no,
    password, address, staff_allotment, pincode, state,
    gst_charges, api_access, sac_code, credit_days, cft,
    domestic_rate_group, international_rate_group,
    domestic_fuel_group, international_fuel_group,
    mis_emails, mis_format, parent_company, customer_type, payment_type,
    is_consignee, shipper_id
  } = req.body;
  
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
    gst_charges === 'Yes' ? 1 : 0, api_access, sac_code, credit_days, cft,
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
