const http = require('http');

http.get('http://localhost:5000/api/customers', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const customers = JSON.parse(data);
      console.log("Customers from API:", customers.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        is_consignee: c.is_consignee,
        shipper_id: c.shipper_id
      })));
    } catch (e) {
      console.error("Parse error:", e);
    }
  });
}).on('error', (err) => {
  console.error("Request error:", err);
});
