const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const rows = await db.allAsync('SELECT * FROM company_settings ORDER BY id ASC');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
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
}));

router.put('/:id', asyncHandler(async (req, res) => {
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
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM company_settings WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
