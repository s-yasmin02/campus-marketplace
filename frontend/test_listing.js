import axios from 'axios';

async function test() {
  try {
    // 1. Register a user
    const email = `test${Date.now()}@example.com`;
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: email,
      password: 'password123',
      role: 'student'
    });
    console.log('Registered user');

    const token = regRes.data.token;

    // 2. Create listing
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    const listRes = await axios.post('http://localhost:5000/api/listings', {
      title: 'Test Listing',
      price: '100',
      description: 'Test Description',
      category: 'Electronics',
      condition: 'New',
      images: []
    }, config);
    console.log('Created listing successfully:', listRes.data);
  } catch (error) {
    console.error('Error creating listing:', error.response ? error.response.data : error.message);
  }
}

test();
