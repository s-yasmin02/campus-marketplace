import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Prevent duplicate follows
followSchema.index({ follower: 1, seller: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
