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

// Prevent duplicate reviews from the same buyer for a specific seller
reviewSchema.index({ reviewer: 1, seller: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
