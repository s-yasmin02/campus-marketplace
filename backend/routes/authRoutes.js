import express from 'express';
import { authUser, registerUser, getUserProfile, updateUserProfile, deleteUserProfile, getUserById, blockUser, unblockUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);
router.get('/user/:id', getUserById);

router.post('/block/:id', protect, blockUser);
router.post('/unblock/:id', protect, unblockUser);

export default router;
