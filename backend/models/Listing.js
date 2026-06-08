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
    enum: ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'For Parts / Not Working', 'New', 'Poor'], // Keeping 'New' and 'Poor' for backward compatibility
  },
  isNegotiable: {
    type: Boolean,
    default: false,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  savedCount: {
    type: Number,
    default: 0,
  },
  deliveryOption: {
    type: String,
    enum: ['Pickup Only', 'Delivery Available'],
    default: 'Pickup Only',
  },
  images: [{
    type: String, // URLs to images
  }],
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Sold', 'Removed'],
    default: 'Available',
  },
}, {
  timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
