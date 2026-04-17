import http from 'http';

const req = http.get({
  hostname: 'localhost',
  port: 8092,
  path: '/api/technician/tickets'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});
