#!/usr/bin/env node

const http = require('http');

const checkEndpoint = (path, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === expectedStatus) {
            resolve({ path, status: res.statusCode, data: json });
          } else {
            reject({ path, status: res.statusCode, expected: expectedStatus, data: json });
          }
        } catch (e) {
          reject({ path, status: res.statusCode, expected: expectedStatus, error: 'Invalid JSON', data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject({ path, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      reject({ path, error: 'Timeout' });
    });
  });
};

const validateBackend = async () => {
  console.log('🔍 Validating Backend API...\n');
  
  const endpoints = [
    { path: '/health', name: 'Basic Health Check' },
    { path: '/api/v1', name: 'API Root' },
    { path: '/api/v1/health', name: 'Detailed Health Check' },
    { path: '/api/v1/health/ping', name: 'Ping Endpoint' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const result = await checkEndpoint(endpoint.path);
      console.log(`✅ ${endpoint.name} (${endpoint.path}): ${result.status}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${endpoint.name} (${endpoint.path}): ${error.status || error.error}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All backend endpoints are working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️ Some endpoints failed. Make sure the server is running on port 3001.');
    process.exit(1);
  }
};

validateBackend().catch(console.error);
