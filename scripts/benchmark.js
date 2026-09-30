const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const totalRequests = 100;
let completed = 0;
const startTime = Date.now();

console.log(`Starting benchmark: sending ${totalRequests} HTTP GET requests to http://localhost:5000/api/health...`);

for (let i = 0; i < totalRequests; i++) {
  const req = http.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      completed++;
      if (completed === totalRequests) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rps = (totalRequests / elapsed).toFixed(2);
        console.log(`\n--- BENCHMARK RESULTS ---`);
        console.log(`Total Requests: ${totalRequests}`);
        console.log(`Time Elapsed: ${elapsed} seconds`);
        console.log(`Throughput: ${rps} requests/second`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.end();
}
