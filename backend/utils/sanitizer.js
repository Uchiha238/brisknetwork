const sanitizeHtml = require('sanitize-html');

/**
 * Global Sanitizer Helper to neutralize XSS/HTML Injection payloads
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  // Use sanitize-html library with safe defaults to strip scripts, event handlers, and unsafe protocols
  return sanitizeHtml(str, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style']
    },
    allowedSchemes: [ 'http', 'https', 'mailto' ]
  });
}

function sanitizeObject(obj, exclusions = []) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, exclusions));
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (exclusions.includes(key)) {
          newObj[key] = obj[key]; // Skip sanitization for excluded keys
        } else {
          newObj[key] = sanitizeObject(obj[key], exclusions);
        }
      }
    }
    return newObj;
  }

  return obj;
}

module.exports = {
  sanitizeString,
  sanitizeObject
};
