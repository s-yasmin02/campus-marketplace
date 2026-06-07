import express from 'express';
import {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect, isStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getListings)
  .post(protect, isStudent, createListing);

router.route('/my-listings')
  .get(protect, getMyListings);

router.route('/:id')
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

export default router;
