const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const { company_id } = req.query;
  const sql = company_id
    ? 'SELECT * FROM company_branches WHERE company_id = ? ORDER BY id ASC'
    : 'SELECT * FROM company_branches ORDER BY id ASC';
  const params = company_id ? [company_id] : [];
  res.json(await db.allAsync(sql, params));
}));

router.get('/next-code', asyncHandler(async (req, res) => {
  const last = await db.getAsync("SELECT branch_code FROM company_branches ORDER BY id DESC LIMIT 1");
  let next = 'BC0001';
  if (last?.branch_code) {
    const num = parseInt(last.branch_code.replace('BC', ''), 10) + 1;
    next = 'BC' + String(num).padStart(4, '0');
  }
  res.json({ code: next });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person } = req.body;
  if (!company_id || !branch_name) return res.status(400).json({ success: false, error: 'company_id and branch_name are required' });
  const result = await db.runAsync(
    'INSERT INTO company_branches (company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [company_id, branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person]
  );
  res.json({ success: true, id: result.lastID });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person } = req.body;
  await db.runAsync(
    'UPDATE company_branches SET branch_name=?, branch_code=?, email=?, contact_no=?, address=?, city=?, state=?, pincode=?, contact_person=? WHERE id=?',
    [branch_name, branch_code, email, contact_no, address, city, state, pincode, contact_person, req.params.id]
  );
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM company_branches WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
