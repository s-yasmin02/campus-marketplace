import Follow from '../models/Follow.js';
import User from '../models/User.js';

// @desc    Toggle follow a seller
// @route   POST /api/follow/:sellerId
// @access  Private
export const toggleFollow = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const followerId = req.user._id;

    if (sellerId === followerId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot follow users' });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (seller.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot be followed' });
    }

    const existingFollow = await Follow.findOne({ follower: followerId, seller: sellerId });

    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      await Follow.create({ follower: followerId, seller: sellerId });
      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if current user is following a seller
// @route   GET /api/follow/status/:sellerId
// @access  Private
export const getFollowStatus = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const followerId = req.user._id;

    const isFollowing = await Follow.exists({ follower: followerId, seller: sellerId });
    res.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get followers and following counts for a user
// @route   GET /api/follow/counts/:userId
// @access  Public
export const getFollowCounts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const followersCount = await Follow.countDocuments({ seller: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    res.json({ followersCount, followingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get list of followers for a user
// @route   GET /api/follow/followers/:userId
// @access  Public
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    // We want the people who follow this seller. So seller: userId. We populate follower.
    const follows = await Follow.find({ seller: userId }).populate('follower', 'name username profilePicture rating');
    const followers = follows.map(f => f.follower);
    res.json(followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get list of users a user is following
// @route   GET /api/follow/following/:userId
// @access  Public
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    // We want the sellers this user follows. So follower: userId. We populate seller.
    const follows = await Follow.find({ follower: userId }).populate('seller', 'name username profilePicture rating');
    const following = follows.map(f => f.seller);
    res.json(following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
