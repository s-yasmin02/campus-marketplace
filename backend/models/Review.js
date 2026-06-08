import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Listing',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Index removed to allow multiple reviews per listing/seller

const Review = mongoose.model('Review', reviewSchema);

export default Review;
