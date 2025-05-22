const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

/**
 * @desc    Get all contests
 * @route   GET /api/contests
 * @access  Public
 * @PUBLIC_INTERFACE
 */
exports.getContests = async (req, res) => {
  try {
    // Initialize query
    let query = Contest.find();
    
    // Filter by status if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    // Sort by date
    query = query.sort('-startDate');
    
    // Execute query
    const contests = await query;
    
    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single contest
 * @route   GET /api/contests/:id
 * @access  Public
 * @PUBLIC_INTERFACE
 */
exports.getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('submissions');
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new contest
 * @route   POST /api/contests
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.createContest = async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;
    
    // Create contest
    const contest = await Contest.create(req.body);
    
    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update contest
 * @route   PUT /api/contests/:id
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.updateContest = async (req, res) => {
  try {
    let contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }
    
    // Update contest
    contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete contest
 * @route   DELETE /api/contests/:id
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }
    
    // Check if there are any submissions
    const submissionCount = await Submission.countDocuments({ contest: req.params.id });
    
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'This contest has submissions and cannot be deleted'
      });
    }
    
    await contest.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Announce contest winners
 * @route   PUT /api/contests/:id/announce-winners
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.announceWinners = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }
    
    // Check if contest is completed
    if (contest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Only completed contests can have winners announced'
      });
    }
    
    // Check if winners already announced
    if (contest.winnerAnnounced) {
      return res.status(400).json({
        success: false,
        error: 'Winners have already been announced for this contest'
      });
    }
    
    // Update contest with winners
    contest.winningSubmissions = req.body.winners;
    contest.winnerAnnounced = true;
    await contest.save();
    
    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
