/**
 * Centralized Input Validation Utility
 */

const validate = {
  required(body, fields) {
    const missing = [];
    for (const f of fields) {
      if (body[f] === undefined || body[f] === null || body[f].toString().trim() === '') {
        missing.push(f);
      }
    }
    return missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null;
  },
  
  email(val) {
    if (!val || typeof val !== 'string' || val.trim() === '') return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Invalid email address format';
  },
  
  phone(val) {
    if (!val || typeof val !== 'string' || val.trim() === '') return null;
    return /^\+?[\d\s-]{7,20}$/.test(val.trim()) ? null : 'Invalid phone number format';
  },
  
  pincode(val) {
    if (!val || typeof val !== 'string' || val.trim() === '') return null;
    return /^\d{5,10}$/.test(val.trim()) ? null : 'Invalid pincode format';
  },
  
  number(val, name) {
    if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '')) return null;
    return isNaN(Number(val)) ? `${name} must be a valid number` : null;
  }
};

module.exports = validate;
