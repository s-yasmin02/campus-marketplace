import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne();
  if (!user) return console.log('no user');
  
  try {
    user.rating = 4.5;
    await user.save();
    console.log('Saved user!');
  } catch(e) {
    console.error('ERROR OCCURRED:', e);
  } finally {
    mongoose.connection.close();
  }
}

test();
