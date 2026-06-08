import mongoose from 'mongoose';

const supportTicketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Bug Report', 'Technical Issue', 'Account Issue', 'Feedback', 'Other', 'support', 'bug'],
      default: 'Other',
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
