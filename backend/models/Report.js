import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  reportedListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending',
  },
  actionTaken: {
    type: String,
    enum: ['Dismiss Report', 'Warn User', 'Remove Listing', 'Suspend User', 'Ban User'],
  },
  adminNotes: {
    type: String,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
