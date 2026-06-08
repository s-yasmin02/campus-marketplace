import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
  },
  type: {
    type: String,
    enum: ['new_listing', 'moderation', 'general'],
    default: 'new_listing'
  },
  message: {
    type: String,
  },
  read: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: true 
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
