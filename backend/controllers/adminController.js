import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban (delete) user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot ban an admin user');
      }
      
      // Delete user's listings
      await Listing.deleteMany({ seller: user._id });
      // Delete user
      await User.findByIdAndDelete(user._id);
      
      res.json({ message: 'User banned and removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all listings
// @route   GET /api/admin/listings
// @access  Private/Admin
export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({}).populate('seller', 'name email');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      await Listing.findByIdAndDelete(req.params.id);
      res.json({ message: 'Listing removed successfully' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .populate('reportedListing', 'title status')
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (report) {
      report.status = status || report.status;
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
