const db = require('../db');

async function logSecurityEvent(eventType, message, ipAddress) {
  try {
    await db.runAsync(
      'INSERT INTO security_logs (event_type, message, ip_address) VALUES (?, ?, ?)',
      [eventType, message, ipAddress || 'Unknown']
    );
  } catch (err) {
    console.error('Failed to write security log:', err);
  }
}

module.exports = {
  logSecurityEvent
};
