import express from 'express';
import {
  getUsers,
  banUser,
  getAllListings,
  deleteListing,
  getReports,
  updateReportStatus,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/users')
  .get(protect, isAdmin, getUsers);

router.route('/users/:id')
  .delete(protect, isAdmin, banUser);

router.route('/listings')
  .get(protect, isAdmin, getAllListings);

router.route('/listings/:id')
  .delete(protect, isAdmin, deleteListing);

router.route('/reports')
  .get(protect, isAdmin, getReports);

router.route('/reports/:id')
  .put(protect, isAdmin, updateReportStatus);

export default router;
