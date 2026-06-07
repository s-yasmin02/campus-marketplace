import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Listing from '../models/Listing.js';
import Wishlist from '../models/Wishlist.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id, user.role);
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    if (user) {
      const token = generateToken(res, user._id, user.role);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const listingsCount = await Listing.countDocuments({ seller: user._id });
      const wishlist = await Wishlist.findOne({ user: user._id });
      const wishlistCount = wishlist ? wishlist.listings.length : 0;

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        username: user.username,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        rating: user.rating,
        numReviews: user.numReviews,
        notificationPreferences: user.notificationPreferences,
        privacyPreferences: user.privacyPreferences,
        appearance: user.appearance,
        createdAt: user.createdAt,
        listingsCount,
        wishlistCount,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.username !== undefined) {
        user.username = req.body.username;
      }
      
      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }
      
      if (req.body.phoneNumber !== undefined) {
        user.phoneNumber = req.body.phoneNumber;
      }
      
      if (req.body.profilePicture !== undefined) {
        user.profilePicture = req.body.profilePicture;
      }
      
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ message: 'Current password is required to change password' });
        }
        if (!(await user.matchPassword(req.body.currentPassword))) {
          return res.status(401).json({ message: 'Incorrect current password' });
        }
        user.password = req.body.newPassword;
      }
      
      if (req.body.notificationPreferences) {
        user.notificationPreferences = { ...user.notificationPreferences, ...req.body.notificationPreferences };
      }
      
      if (req.body.privacyPreferences) {
        user.privacyPreferences = { ...user.privacyPreferences, ...req.body.privacyPreferences };
      }

      if (req.body.appearance) {
        user.appearance = req.body.appearance;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        username: updatedUser.username,
        bio: updatedUser.bio,
        phoneNumber: updatedUser.phoneNumber,
        notificationPreferences: updatedUser.notificationPreferences,
        privacyPreferences: updatedUser.privacyPreferences,
        appearance: updatedUser.appearance,
        token: generateToken(res, updatedUser._id, updatedUser.role),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Cascade deletions
      await Listing.deleteMany({ seller: user._id });
      await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });
      await Review.deleteMany({ buyer: user._id });
      await Wishlist.deleteOne({ user: user._id });

      await User.deleteOne({ _id: user._id });
      
      res.json({ message: 'User account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
