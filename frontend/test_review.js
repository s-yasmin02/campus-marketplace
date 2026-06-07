import axios from 'axios';

async function test() {
  try {
    // 1. Register seller
    const sellerEmail = `seller${Date.now()}@example.com`;
    const sellerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Seller User',
      email: sellerEmail,
      password: 'password123',
      role: 'student'
    });
    const sellerToken = sellerRes.data.token;
    const sellerId = sellerRes.data._id;

    // 2. Register reviewer
    const reviewerEmail = `reviewer${Date.now()}@example.com`;
    const reviewerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Reviewer User',
      email: reviewerEmail,
      password: 'password123',
      role: 'student'
    });
    const reviewerToken = reviewerRes.data.token;

    // 3. Create review
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reviewerToken}`
      }
    };
    
    const reviewRes = await axios.post('http://localhost:5000/api/reviews', {
      sellerId: sellerId,
      rating: 4,
      comment: 'Great seller'
    }, config);
    console.log('Created review successfully:', reviewRes.data);
  } catch (error) {
    console.error('Error creating review:', error.response ? error.response.data : error.message);
  }
}

test();
