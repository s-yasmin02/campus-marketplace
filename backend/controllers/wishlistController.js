import Wishlist from '../models/Wishlist.js';
import Listing from '../models/Listing.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'listings',
      populate: { path: 'seller', select: 'name email' }
    });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, listings: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  const { listingId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, listings: [listingId] });
      await Listing.findByIdAndUpdate(listingId, { $inc: { savedCount: 1 } });
    } else {
      if (!wishlist.listings.includes(listingId)) {
        wishlist.listings.push(listingId);
        await wishlist.save();
        
        // Increment listing savedCount
        await Listing.findByIdAndUpdate(listingId, { $inc: { savedCount: 1 } });
      }
    }

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:listingId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      const wasIncluded = wishlist.listings.some(id => id.toString() === req.params.listingId.toString());
      wishlist.listings = wishlist.listings.filter(
        (id) => id.toString() !== req.params.listingId.toString()
      );
      await wishlist.save();

      if (wasIncluded) {
        await Listing.findByIdAndUpdate(req.params.listingId, { $inc: { savedCount: -1 } });
      }
      res.json(wishlist);
    } else {
      res.status(404).json({ message: 'Wishlist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
