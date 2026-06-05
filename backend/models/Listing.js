import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  },
  images: [{
    type: String, // URLs to images
  }],
  status: {
    type: String,
    enum: ['active', 'sold'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
