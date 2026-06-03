const db = require('./db');

async function check() {
  try {
    await db.runAsync("UPDATE customers SET payment_type = 'Cash' WHERE id = 7");
    const customers = await db.allAsync('SELECT id, code, name, city, state, address, pincode, payment_type FROM customers');
    console.log(JSON.stringify(customers, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
