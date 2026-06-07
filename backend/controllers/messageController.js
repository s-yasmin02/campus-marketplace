import Message from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Get all unique conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'name').populate('receiver', 'name').populate('listing', 'title images').sort({ createdAt: -1 });

    // Extract unique conversations
    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determine the 'other' person in the chat
      const otherUserId = msg.sender._id.toString() === userId.toString() 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
        
      const key = `${otherUserId}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUser: msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: (msg.receiver._id.toString() === userId.toString() && !msg.read) ? 1 : 0
        });
      } else {
        const existing = conversationsMap.get(key);
        if (msg.receiver._id.toString() === userId.toString() && !msg.read) {
          existing.unreadCount += 1;
        }
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages between logged in user and another user for a specific listing (optional)
// @route   GET /api/messages/:otherUserId/:listingId?
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    let query = {
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    };

    const messages = await Message.find(query).populate('sender', 'name').populate('listing', 'title').sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a new message to the database
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  const { receiverId, content, listingId } = req.body;

  try {
    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      listing: listingId !== 'general' ? listingId : null
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'name');
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
