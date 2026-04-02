const db = require('./db');

async function check() {
  try {
    const customers = await db.allAsync('SELECT id, code, name, city, state, address, pincode FROM customers');
    console.log(JSON.stringify(customers, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
