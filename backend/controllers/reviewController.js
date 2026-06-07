import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { sellerId, rating, comment } = req.body;

  try {
    if (sellerId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check for duplicate review
    const alreadyReviewed = await Review.findOne({
      reviewer: req.user._id,
      seller: sellerId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this seller' });
    }

    const review = new Review({
      reviewer: req.user._id,
      seller: sellerId,
      rating: Number(rating),
      comment,
    });

    await review.save();

    // Update seller's average rating
    const reviews = await Review.find({ seller: sellerId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    seller.numReviews = numReviews;
    seller.rating = avgRating;
    await seller.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews for a seller
// @route   GET /api/reviews/:sellerId
// @access  Public
export const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
