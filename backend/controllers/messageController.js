import Message from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import ConversationMeta from '../models/ConversationMeta.js';

// @desc    Get all unique conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'name profilePicture').populate('receiver', 'name profilePicture').populate('listing', 'title images').sort({ createdAt: -1 });

    // Fetch ConversationMeta for the user
    const metaDatas = await ConversationMeta.find({ user: userId });
    const metaMap = new Map();
    metaDatas.forEach(meta => {
      metaMap.set(meta.otherUser.toString(), meta);
    });

    // Extract unique conversations
    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determine the 'other' person in the chat
      const otherUserId = msg.sender._id.toString() === userId.toString() 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
        
      const key = `${otherUserId}`;
      const meta = metaMap.get(key);

      // Skip message if it was sent before the user "deleted" the chat
      if (meta && meta.deletedAt && new Date(msg.createdAt) < new Date(meta.deletedAt)) {
        return;
      }

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUser: msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: (msg.receiver._id.toString() === userId.toString() && !msg.read) ? 1 : 0,
          isArchived: meta ? meta.isArchived : false
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

    // Fetch meta
    const meta = await ConversationMeta.findOne({ user: userId, otherUser: otherUserId });

    let messages = await Message.find(query).populate('sender', 'name profilePicture').populate('listing', 'title').sort({ createdAt: 1 });

    if (meta && meta.deletedAt) {
      messages = messages.filter(msg => new Date(msg.createdAt) >= new Date(meta.deletedAt));
    }

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
    const senderUser = await User.findById(req.user._id);
    const receiverUser = await User.findById(receiverId);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (senderUser.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ message: 'You have blocked this user.' });
    }

    if (receiverUser.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'This user has blocked you.' });
    }

    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      listing: listingId !== 'general' ? listingId : null
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'name profilePicture');
    
    // Unarchive the chat for the recipient automatically when a new message arrives
    await ConversationMeta.findOneAndUpdate(
      { user: receiverId, otherUser: req.user._id },
      { isArchived: false },
      { upsert: true }
    );

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update Conversation Meta (Archive, Delete)
// @route   PUT /api/messages/meta/:otherUserId
// @access  Private
export const updateConversationMeta = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { isArchived, deleteChat } = req.body;

    let meta = await ConversationMeta.findOne({ user: req.user._id, otherUser: otherUserId });
    
    if (!meta) {
      meta = new ConversationMeta({
        user: req.user._id,
        otherUser: otherUserId,
      });
    }

    if (isArchived !== undefined) {
      meta.isArchived = isArchived;
    }

    if (deleteChat) {
      meta.deletedAt = new Date();
      meta.isArchived = false; // Reset archive status if deleted
    }

    await meta.save();
    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
