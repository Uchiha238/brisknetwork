const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('courier.db');

db.serialize(() => {
  db.all("PRAGMA table_info(countries)", [], (err, columns) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Countries table columns:', columns);
    
    db.all("SELECT * FROM countries", [], (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Countries table rows:', rows);
      db.close();
    });
  });
});





