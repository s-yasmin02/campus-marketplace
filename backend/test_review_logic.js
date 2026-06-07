import mongoose from 'mongoose';
import Review from './models/Review.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a seller
  const seller = await User.findOne();
  if (!seller) return console.log('no seller');
  
  // Find a reviewer
  const reviewer = await User.findOne({ _id: { $ne: seller._id } });
  if (!reviewer) return console.log('no reviewer');
  
  try {
    const review = new Review({
      reviewer: reviewer._id,
      seller: seller._id,
      rating: 5,
      comment: 'Test comment'
    });
    
    await review.save();
    console.log('Saved review!');
    
    const reviews = await Review.find({ seller: seller._id });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    seller.numReviews = numReviews;
    seller.rating = avgRating;
    await seller.save();
    console.log('Saved seller!');
  } catch(e) {
    console.error('ERROR OCCURRED:', e);
  } finally {
    mongoose.connection.close();
  }
}

test();
