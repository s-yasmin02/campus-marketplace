import mongoose from 'mongoose';

const conversationMetaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  otherUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const ConversationMeta = mongoose.model('ConversationMeta', conversationMetaSchema);

export default ConversationMeta;
