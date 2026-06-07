/**
 * useFormData.js — Default form state and masters data.
 *
 * Pure data: initial field values for a new shipment form,
 * and the static shape of the masters lookup object.
 */

export const createDefaultFormData = (initialType = 'domestic') => ({
  booking_company: '',
  airway_no: (initialType === 'domestic' ? 'DOM' : 'INT') + Math.floor(100000 + Math.random() * 900000),
  edit_awb: false,
  email: 'OPSOMCOURIER@GMAIL.COM',
  payment_mode: 'CASH',
  contact_no: '9029200429',
  account_code: 'WCC9723',
  origin_hub: 'MUMBAI',
  origin_zone: '',
  destination: '',
  dest_zone: '',
  product: '',
  booking_date: new Date().toISOString().split('T')[0],
  booking_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
  usps_number: '',
  forward_no: '',
  eway_bill_no: '',
  service: '',
  mode: '',
  duty: '',
  ref_no: '',
  shipment_value: '',
  currency: 'INR',
  invoice_date: new Date().toISOString().split('T')[0],
  invoice_no: '',
  content: '',

  // Shipper / Consigner
  shipper_code: '',
  shipper_company: '',
  shipper_name: '',
  shipper_address1: '',
  shipper_address2: '',
  shipper_address3: '',
  shipper_zip: '',
  shipper_city: '',
  shipper_state: '',
  shipper_zone: '',
  shipper_country: 'INDIA',
  shipper_phone: '+91',
  shipper_email: '',
  shipper_kyc_type: 'PAN CARD',
  shipper_kyc_no: '',
  shipper_save: false,
  shipper_update: false,

  // Consignee
  consignee_code: '',
  consignee_company: '',
  consignee_name: '',
  consignee_address1: '',
  consignee_address2: '',
  consignee_address3: '',
  consignee_zip: '',
  consignee_city: '',
  consignee_state: '',
  consignee_zone: '',
  consignee_country: 'INDIA',
  consignee_phone: '',
  consignee_email: '',
  consignee_save: false,
  consignee_update: false,

  // Weights & Dimensions
  pcs: 1,
  actual_weight: 0,
  volumetric_weight: 0,
  chargeable_weight: 0,
  packages: [
    { box_no: '1', actual_wt: 0, length: 0, breadth: 0, height: 0, vol_wt: 0, chargeable_wt: 0 },
  ],

  // Billing / Charges
  freight_ch: 0,
  pickup_ch: 0,
  cod_ch: 0,
  other_ch: 0,
  fuel_surcharge: 0,
  transport_ch: 0,
  remote_area_ch: 0,
  awb_ch: 0,
  ras_ch: 0,
  ers_ch: 0,
  odd_dimension_ch: 0,
  address_change_ch: 0,
  dg_ch: 0,
  import_duty_ch: 0,
  adc_noc_ch: 0,
  electronic_item_ch: 0,
  odd_weight_ch: 0,
  packing_ch: 0,
  handling_ch: 0,
  
  // International Specific Charges
  destination_ch: 0,
  clearance_ch: 0,
  ess_ch: 0,
  oda_ch: 0,
  ddp_ch: 0,

  charges_date: new Date().toISOString().split('T')[0],

  // Final Billing
  sub_total: 0,
  cgst_ch: 0,
  sgst_ch: 0,
  grand_total: 0,

  // Invoice
  create_invoice: false,
  invoice_type: 'INVOICE',
  note: 'GIFT',
  items: [{ box_no: '1', sr_no: 1, description: '', hs_code: '', unit_type: 'PCS', quantity: 1, unit_weight: 0, unit_rate: 0, amount: 0 }],

  // Behavior
  save_as_new_customer: false,
  new_customer_code: '',
  branch: ''
});

export const createDefaultMasters = () => ({
  states: [],
  shipperCities: [],
  consigneeCities: [],
  couriers: ['DHL', 'FEDEX', 'UPS', 'SELF'],
  modes: [],
  products: ['DOCUMENTS', 'PARCEL'],
  billTypes: ['PREPAID', 'COD', 'TO PAY', 'CASH', 'CREDIT'],
  forwarders: ['DHL EXPRESS', 'FEDEX PRIORITY', 'SELF'],
  countries: [],
  branches: []
});
