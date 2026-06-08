import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  updateConversationMeta
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations')
  .get(protect, getConversations);

router.route('/meta/:otherUserId')
  .put(protect, updateConversationMeta);

router.route('/:otherUserId')
  .get(protect, getMessages);

export default router;
