const axios = require('axios');

// Configure axios like the frontend does
axios.defaults.baseURL = 'http://localhost:5003';

async function testAPI() {
  console.log('Testing API endpoints...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('/api/health');
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test products endpoint with relative path
    console.log('\n2. Testing products endpoint (relative path)...');
    const productsResponse = await axios.get('/api/products');
    console.log('✅ Products fetch successful:', {
      count: productsResponse.data.products?.length || 0,
      status: productsResponse.status
    });
    
    // Test products endpoint with full URL
    console.log('\n3. Testing products endpoint (full URL)...');
    const productsFullResponse = await axios.get('http://localhost:5003/api/products');
    console.log('✅ Products fetch (full URL) successful:', {
      count: productsFullResponse.data.products?.length || 0,
      status: productsFullResponse.status
    });
    
  } catch (error) {
    console.error('❌ API test failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testAPI();