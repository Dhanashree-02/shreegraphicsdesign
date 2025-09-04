const axios = require('axios');

// Test the reviews endpoint
async function testReviews() {
  try {
    // First test without auth
    console.log('Testing /api/admin/reviews without auth...');
    const response1 = await axios.get('http://localhost:5001/api/admin/reviews');
    console.log('Success without auth:', response1.status);
  } catch (error) {
    console.log('Error without auth:', error.response?.status, error.response?.data?.message || error.message);
  }

  try {
    // Test with fake token
    console.log('\nTesting /api/admin/reviews with fake token...');
    const response2 = await axios.get('http://localhost:5001/api/admin/reviews', {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    console.log('Success with fake token:', response2.status);
  } catch (error) {
    console.log('Error with fake token:', error.response?.status, error.response?.data?.message || error.message);
  }

  try {
    // Test products endpoint for comparison
    console.log('\nTesting /api/products...');
    const response3 = await axios.get('http://localhost:5001/api/products');
    console.log('Products success:', response3.status, 'Products count:', response3.data?.products?.length || 0);
  } catch (error) {
    console.log('Products error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testReviews();