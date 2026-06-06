const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const shipments = await db.allAsync(`
    SELECT s.*, c.name as customer_name 
    FROM shipments s 
    LEFT JOIN customers c ON s.customer_id = c.id
  `);
  res.json(shipments);
}));

router.post('/', asyncHandler(async (req, res) => {
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
    branch,
    eway_bill_no,

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
      charges_date, branch, eway_bill_no
    ) VALUES (
      ?, ?, ?, ?, 'booked',
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
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
    charges_date, branch, eway_bill_no
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
}));

router.put('/:id/status', asyncHandler(async (req, res) => {
  const { status, location } = req.body;
  await db.runAsync('UPDATE shipments SET status = ? WHERE id = ?', [status, req.params.id]);
  await db.runAsync('INSERT INTO tracking (shipment_id, status, location, event_time) VALUES (?, ?, ?, ?)', [req.params.id, status, location, new Date().toISOString()]);
  res.json({ success: true });
}));

router.get('/:id/tracking', asyncHandler(async (req, res) => {
  const tracking = await db.allAsync('SELECT * FROM tracking WHERE shipment_id = ? ORDER BY event_time DESC', [req.params.id]);
  res.json(tracking);
}));

// Retrieve a single shipment details with packages and items
router.get('/:id', asyncHandler(async (req, res) => {
  const shipment = await db.getAsync('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
  if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
  
  const packages = await db.allAsync('SELECT * FROM packages WHERE shipment_id = ?', [req.params.id]);
  const items = await db.allAsync('SELECT * FROM shipment_items WHERE shipment_id = ?', [req.params.id]);
  
  res.json({
    success: true,
    shipment: {
      ...shipment,
      packages,
      items
    }
  });
}));

// Delete a shipment and its associated entities
router.delete('/:id', asyncHandler(async (req, res) => {
  await db.runAsync('DELETE FROM packages WHERE shipment_id = ?', [req.params.id]);
  await db.runAsync('DELETE FROM shipment_items WHERE shipment_id = ?', [req.params.id]);
  await db.runAsync('DELETE FROM tracking WHERE shipment_id = ?', [req.params.id]);
  await db.runAsync('DELETE FROM shipments WHERE id = ?', [req.params.id]);
  res.json({ success: true });
}));

// Update an existing shipment
router.put('/:id', asyncHandler(async (req, res) => {
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
    branch,
    eway_bill_no,

    packages, items 
  } = req.body;

  await db.runAsync(`
    UPDATE shipments SET
      customer_id=?, user_id=?, airway_no=?, type=?,
      booking_date=?, booking_time=?, product=?, origin_hub=?, origin_zone=?,
      destination=?, dest_zone=?, usps_number=?, service=?, duty=?,
      ref_no=?, shipment_value=?, currency=?, invoice_date=?, invoice_no=?, account_code=?,
      
      shipper_name=?, shipper_company=?, shipper_address1=?, shipper_address2=?, shipper_address3=?,
      shipper_city=?, shipper_state=?, shipper_zip=?, shipper_country=?, shipper_phone=?, shipper_email=?,
      shipper_kyc_type=?, shipper_kyc_no=?,

      consignee_name=?, consignee_company=?, consignee_address1=?, consignee_address2=?, consignee_address3=?,
      consignee_city=?, consignee_state=?, consignee_zip=?, consignee_country=?, consignee_phone=?, consignee_email=?,

      pcs=?, actual_weight=?, volumetric_weight=?, chargeable_weight=?,
      bill_amount=?, fuel_amount=?, gst_amount=?, freight_charges=?, total_charges=?,
      
      forward_no=?, forwarder=?, description=?, bill_type=?, type_of_doc=?, doc_number=?,
      destination_ch=?, ess_ch=?, oda_ch=?, transport_ch=?, clearance_ch=?, other_ch=?, ddp_ch=?,
      charges_date=?, branch=?, eway_bill_no=?
    WHERE id=?
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
    charges_date, branch, eway_bill_no,
    req.params.id
  ]);

  // Re-create packages
  await db.runAsync('DELETE FROM packages WHERE shipment_id = ?', [req.params.id]);
  if (packages && packages.length > 0) {
    for (const pkg of packages) {
      await db.runAsync(`
        INSERT INTO packages (
          shipment_id, box_no, actual_wt, length, breadth, height, vol_wt, chargeable_wt, per_box_wt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.params.id, pkg.box_no || '1', pkg.actual_wt || 0, pkg.length || 0, pkg.breadth || 0, pkg.height || 0, pkg.vol_wt || 0, pkg.chargeable_wt || 0, pkg.per_box_wt || 0]);
    }
  }

  // Re-create items
  await db.runAsync('DELETE FROM shipment_items WHERE shipment_id = ?', [req.params.id]);
  if (items && items.length > 0) {
    for (const item of items) {
      await db.runAsync(`
        INSERT INTO shipment_items (
          shipment_id, box_no, sr_no, description, hs_code, unit_type, quantity, unit_weight, igst, unit_rate, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.params.id, item.box_no || '1', item.sr_no || 1, item.description || '', item.hs_code || '', item.unit_type || 'PCS', item.quantity || 0, item.unit_weight || 0, item.igst || 0, item.unit_rate || 0, item.amount || 0]);
    }
  }

  res.json({ success: true });
}));

module.exports = router;
