import Report from '../models/Report.js';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  const { reportedListing, reportedUser, reason } = req.body;

  try {
    const report = new Report({
      reporter: req.user._id,
      reportedListing,
      reportedUser,
      reason,
    });

    const createdReport = await report.save();
    res.status(201).json(createdReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
