import mongoose from 'mongoose';
import Message from './models/Message.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const messages = await Message.find().populate('sender').populate('receiver').populate('listing');
  console.log(`Found ${messages.length} messages.`);
  for (const m of messages) {
    console.log(`Msg: ${m._id}`);
    console.log(`  Sender: ${m.sender ? m.sender._id : 'null'}`);
    console.log(`  Receiver: ${m.receiver ? m.receiver._id : 'null'}`);
    console.log(`  Listing: ${m.listing ? m.listing._id : 'null'}`);
  }
  process.exit(0);
}
check();
