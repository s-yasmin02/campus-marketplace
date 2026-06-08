import Listing from '../models/Listing.js';
import Follow from '../models/Follow.js';
import Message from '../models/Message.js';

// @desc    Fetch all listings
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const category = req.query.category && req.query.category !== 'All'
      ? { category: req.query.category }
      : {};

    const statusFilter = req.query.status && req.query.status !== 'All' 
      ? { status: req.query.status } 
      : { status: 'Available' };

    // If they explicitly pass 'All', we don't restrict by status
    if (req.query.status === 'All') {
      delete statusFilter.status;
    }

    const listings = await Listing.find({ 
      ...keyword,
      ...category,
      ...statusFilter
    }).populate('seller', 'name email rating numReviews');
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch logged in user listings
// @route   GET /api/listings/my-listings
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).populate('seller', 'name email rating numReviews');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single listing
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email rating numReviews');
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res) => {
  const { title, description, price, category, condition, images } = req.body;

  try {
    const listing = new Listing({
      title,
      description,
      price,
      category,
      condition,
      images: images || [],
      seller: req.user._id,
    });

    const createdListing = await listing.save();

    // Notify followers
    try {
      const followers = await Follow.find({ seller: req.user._id });
      const Notification = (await import('../models/Notification.js')).default;
      
      const notifications = await Promise.all(followers.map(async f => {
        const notif = await Notification.create({
          recipient: f.follower,
          sender: req.user._id,
          listing: createdListing._id,
          read: false
        });
        
        // Populate for socket emission
        return await Notification.findById(notif._id)
          .populate('sender', 'name profilePicture')
          .populate('listing', 'title images');
      }));

      // Emit via Socket.io
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      if (io && userSockets) {
        notifications.forEach(notif => {
          const socketId = userSockets.get(notif.recipient.toString());
          if (socketId) {
            io.to(socketId).emit('new_notification', notif);
          }
        });
      }
    } catch (notifError) {
      console.error('Error sending notifications to followers:', notifError);
    }

    res.status(201).json(createdListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
  const { title, description, price, category, condition, images, status } = req.body;

  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Check if user is seller (only owner student can update)
      if (listing.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this listing' });
      }

      listing.title = title || listing.title;
      listing.description = description || listing.description;
      listing.price = price || listing.price;
      listing.category = category || listing.category;
      listing.condition = condition || listing.condition;
      listing.images = images || listing.images;
      listing.status = status || listing.status;

      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Check if user is seller or admin
      if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized to delete this listing' });
      }

      await listing.deleteOne();
      res.json({ message: 'Listing removed' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
