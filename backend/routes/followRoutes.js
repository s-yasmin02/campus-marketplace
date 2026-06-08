import express from 'express';
import { toggleFollow, getFollowStatus, getFollowCounts, getFollowers, getFollowing } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:sellerId', protect, toggleFollow);
router.get('/status/:sellerId', protect, getFollowStatus);
router.get('/counts/:userId', getFollowCounts);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

export default router;
