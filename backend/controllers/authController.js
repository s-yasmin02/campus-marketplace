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
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ message: 'Your account has been temporarily suspended due to a policy violation.' });
      }
      if (user.accountStatus === 'banned') {
        return res.status(403).json({ message: 'Your account has been permanently banned due to a severe policy violation.' });
      }

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
        blockedUsers: user.blockedUsers,
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

// @desc    Get user by ID (Public profile)
// @route   GET /api/auth/user/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notificationPreferences -appearance');

    if (user) {
      const listingsCount = await Listing.countDocuments({ seller: user._id, status: 'Available' });
      
      const responseData = {
        _id: user._id,
        role: user.role,
        name: user.name,
        profilePicture: user.profilePicture,
        username: user.username,
        bio: user.bio,
        rating: user.rating,
        numReviews: user.numReviews,
        createdAt: user.createdAt,
        listingsCount,
      };

      if (user.privacyPreferences?.showEmail) {
        responseData.email = user.email;
      }

      if (user.privacyPreferences?.showPhoneNumber) {
        responseData.phoneNumber = user.phoneNumber;
      }

      res.json(responseData);
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

// @desc    Block a user
// @route   POST /api/auth/block/:id
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    if (!userToBlock) return res.status(404).json({ message: 'User not found' });

    const user = await User.findById(req.user._id);
    if (!user.blockedUsers.includes(userToBlock._id)) {
      user.blockedUsers.push(userToBlock._id);
      await user.save();
    }
    
    res.json({ message: 'User blocked successfully', blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unblock a user
// @route   POST /api/auth/unblock/:id
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== req.params.id.toString()
    );
    await user.save();
    
    res.json({ message: 'User unblocked successfully', blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({ message: 'Email exists' });
    } else {
      res.status(404).json({ message: 'User with this email not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();
      res.json({ message: 'Password reset successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
