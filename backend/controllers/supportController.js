import SupportTicket from '../models/SupportTicket.js';

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { subject, message, type } = req.body;

    if (!subject || !message || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const ticket = new SupportTicket({
      user: req.user._id,
      subject,
      message,
      type
    });

    const createdTicket = await ticket.save();

    res.status(201).json(createdTicket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Server error while creating ticket' });
  }
};
