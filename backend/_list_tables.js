const s = require('sqlite3').verbose();
const d = new s.Database('./courier.db');
d.all("SELECT name FROM sqlite_master WHERE type='table'", [], function(_, r) {
  console.log(r.map(function(x) { return x.name; }));
  d.close();
});
