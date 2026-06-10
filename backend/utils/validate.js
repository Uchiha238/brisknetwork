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
    if (!val) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Invalid email address format';
  },
  
  phone(val) {
    if (!val) return null;
    return /^\+?\d[\d -]{6,15}$/.test(val) ? null : 'Invalid phone number format';
  },
  
  pincode(val) {
    if (!val) return null;
    return /^\d{5,10}$/.test(val) ? null : 'Invalid pincode format';
  },
  
  number(val, name) {
    if (val === undefined || val === null) return null;
    return isNaN(Number(val)) ? `${name} must be a valid number` : null;
  }
};

module.exports = validate;
