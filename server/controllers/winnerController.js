const Winner = require('../models/Winner');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

/**
 * @desc    Select a winner for a contest
 * @route   POST /api/winners
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.selectWinner = async (req, res) => {
  try {
    const { contestId, submissionId, rank } = req.body;

    // Verify contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Verify contest is completed
    if (contest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Winners can only be selected for completed contests'
      });
    }

    // Verify submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Verify submission belongs to the contest
    if (submission.contest.toString() !== contestId) {
      return res.status(400).json({
        success: false,
        error: 'This submission does not belong to the specified contest'
      });
    }

    // Verify submission is approved
    if (submission.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Only approved submissions can be selected as winners'
      });
    }
    
    // Create winner record
    const winner = await Winner.create({
      contest: contestId,
      submission: submissionId,
      rank,
      selectedBy: req.user.id
    });

    // Update the contest's winningSubmissions array
    await Contest.findByIdAndUpdate(
      contestId,
      {
        $push: { winningSubmissions: { rank, submission: submissionId } },
        winnerAnnounced: true
      }
    );

    await winner.populate([
      { path: 'submission', select: 'title imageUrl user' },
      { path: 'contest', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      data: winner
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This submission or rank has already been assigned as a winner for this contest'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get all winners for a contest
 * @route   GET /api/winners/:contestId
 * @access  Public
 * @PUBLIC_INTERFACE
 */
exports.getWinnersByContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    // Verify contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Get winners for the contest
    const winners = await Winner.find({ contest: contestId })
      .sort('rank')
      .populate({
        path: 'submission',
        select: 'title description imageUrl user',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    res.status(200).json({
      success: true,
      count: winners.length,
      data: winners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
