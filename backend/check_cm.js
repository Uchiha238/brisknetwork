const db = require('./db');

async function test() {
  try {
    const row = await db.getAsync("SELECT * FROM customers WHERE name LIKE '%CM DESIGN%'");
    console.log("CM DESIGN ROW:", row);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

test();
