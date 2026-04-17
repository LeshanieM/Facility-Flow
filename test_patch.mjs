import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 8092,
  path: '/api/technician/tickets/1/status', // I don't know a real ID though!
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.write(JSON.stringify({ status: "IN_PROGRESS" }));
req.end();
