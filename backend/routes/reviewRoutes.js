import express from 'express';
import { createReview, getSellerReviews, updateReview, deleteReview, getListingReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:sellerId', getSellerReviews);
router.get('/listing/:listingId', getListingReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
