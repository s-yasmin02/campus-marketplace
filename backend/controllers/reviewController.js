import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { sellerId, listingId, rating, comment } = req.body;

  try {
    if (sellerId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check for duplicate review - REMOVED to allow multiple reviews per user request

    const review = new Review({
      reviewer: req.user._id,
      seller: sellerId,
      listing: listingId,
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

// @desc    Get all reviews for a listing
// @route   GET /api/reviews/listing/:listingId
// @access  Public
export const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    // Recalculate seller's average rating
    const seller = await User.findById(review.seller);
    const reviews = await Review.find({ seller: review.seller });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    seller.numReviews = numReviews;
    seller.rating = avgRating;
    await seller.save();

    res.json({ message: 'Review updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const sellerId = review.seller;
    
    // Use deleteOne instead of remove for newer mongoose versions
    await Review.deleteOne({ _id: review._id });

    // Recalculate seller's average rating
    const seller = await User.findById(sellerId);
    const reviews = await Review.find({ seller: sellerId });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    seller.numReviews = numReviews;
    seller.rating = avgRating;
    await seller.save();

    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
