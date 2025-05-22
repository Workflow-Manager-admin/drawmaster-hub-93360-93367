const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limit to 5MB
  },
  fileFilter: fileFilter
}).single('image');

/**
 * @desc    Get all submissions
 * @route   GET /api/submissions
 * @access  Private
 * @PUBLIC_INTERFACE
 */
exports.getSubmissions = async (req, res) => {
  try {
    // For regular users, only show their own submissions
    // For admins, show all submissions if no specific user is requested
    let query;
    
    if (req.user.role === 'admin' && req.query.user) {
      query = Submission.find({ user: req.query.user });
    } else if (req.user.role === 'admin') {
      query = Submission.find();
    } else {
      query = Submission.find({ user: req.user.id });
    }
    
    // Add population
    query = query.populate('contest', 'title status deadline');
    
    // Sort by submission date
    query = query.sort('-submittedAt');
    
    // Execute query
    const submissions = await query;
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single submission
 * @route   GET /api/submissions/:id
 * @access  Public
 * @PUBLIC_INTERFACE
 */
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name')
      .populate('contest', 'title status deadline');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Create new submission
 * @route   POST /api/submissions
 * @access  Private
 * @PUBLIC_INTERFACE
 */
exports.createSubmission = async (req, res) => {
  // Use multer upload middleware
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        error: `Error: ${err.message}`
      });
    }
    
    try {
      // Add user to request body
      req.body.user = req.user.id;
      
      // Check if contest exists and is active
      const contest = await Contest.findById(req.body.contest);
      
      if (!contest) {
        return res.status(404).json({
          success: false,
          error: 'Contest not found'
        });
      }
      
      if (contest.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `Cannot submit to a contest that is ${contest.status}`
        });
      }
      
      // Check if user already submitted to this contest
      const existingSubmission = await Submission.findOne({
        user: req.user.id,
        contest: req.body.contest
      });
      
      if (existingSubmission) {
        // If file was uploaded, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          error: 'You have already submitted to this contest'
        });
      }
      
      // Handle image URL
      let imageUrl = req.body.imageUrl;
      
      // If file was uploaded, use its path instead
      if (req.file) {
        // Create a URL-friendly path to the uploaded file
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
      
      // Ensure we have an image URL
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'An image URL or file upload is required'
        });
      }
      
      // Create submission with file path
      const submissionData = {
        title: req.body.title,
        description: req.body.description,
        contest: req.body.contest,
        user: req.user.id,
        imageUrl: imageUrl
      };
      
      const submission = await Submission.create(submissionData);
      
      res.status(201).json({
        success: true,
        data: submission
      });
    } catch (error) {
      // If file was uploaded, delete it on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });
};

/**
 * @desc    Update submission
 * @route   PUT /api/submissions/:id
 * @access  Private
 * @PUBLIC_INTERFACE
 */
exports.updateSubmission = async (req, res) => {
  // Use multer upload middleware
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        error: `Error: ${err.message}`
      });
    }
    
    try {
      let submission = await Submission.findById(req.params.id);
      
      if (!submission) {
        // If file was uploaded, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(404).json({
          success: false,
          error: 'Submission not found'
        });
      }
      
      // Make sure user is submission owner or admin
      if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
        // If file was uploaded, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this submission'
        });
      }
      
      // Get the contest
      const contest = await Contest.findById(submission.contest);
      
      // Check if contest is still active (unless user is admin)
      if (contest.status !== 'active' && req.user.role !== 'admin') {
        // If file was uploaded, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          error: 'Cannot update submission after contest deadline'
        });
      }
      
      // Update fields
      const fieldsToUpdate = {};
      
      if (req.body.title) fieldsToUpdate.title = req.body.title;
      if (req.body.description) fieldsToUpdate.description = req.body.description;
      
      // Handle image URL update
      if (req.file) {
        // Create a URL-friendly path to the uploaded file
        fieldsToUpdate.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        // If there was an old image and it's in our uploads folder, delete it
        if (submission.imageUrl && submission.imageUrl.includes('/uploads/')) {
          try {
            const oldImagePath = submission.imageUrl.split('/uploads/')[1];
            if (oldImagePath) {
              const oldFilePath = path.join('./uploads', oldImagePath);
              if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
              }
            }
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      } else if (req.body.imageUrl) {
        fieldsToUpdate.imageUrl = req.body.imageUrl;
      }
      
      // Update submission
      submission = await Submission.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
      });
      
      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      // If file was uploaded, delete it on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });
};

/**
 * @desc    Delete submission
 * @route   DELETE /api/submissions/:id
 * @access  Private
 * @PUBLIC_INTERFACE
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Make sure user is submission owner or admin
    if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this submission'
      });
    }
    
    // Get the contest
    const contest = await Contest.findById(submission.contest);
    
    // Check if contest is still active (unless admin)
    if (contest.status !== 'active' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete submission after contest deadline'
      });
    }
    
    await submission.deleteOne();
    
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
 * @desc    Get submissions by contest
 * @route   GET /api/submissions/contest/:contestId
 * @access  Public
 * @PUBLIC_INTERFACE
 */
exports.getSubmissionsByContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }
    
    // Find approved submissions for this contest
    const submissions = await Submission.find({ 
      contest: req.params.contestId,
      status: 'approved'
    }).populate('user', 'name');
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update submission status (approve/reject)
 * @route   PUT /api/submissions/:id/status
 * @access  Admin only
 * @PUBLIC_INTERFACE
 */
exports.updateSubmissionStatus = async (req, res) => {
  try {
    if (!req.body.status || !['approved', 'rejected', 'pending'].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (approved, rejected, or pending)'
      });
    }
    
    let submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Update status
    submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Rate a submission
 * @route   PUT /api/submissions/:id/rate
 * @access  Private
 * @PUBLIC_INTERFACE
 */
exports.rateSubmission = async (req, res) => {
  try {
    // Validate rating
    const rating = parseInt(req.body.rating);
    
    if (isNaN(rating) || rating < 0 || rating > 10) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be a number between 0 and 10'
      });
    }
    
    let submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Prevent users from rating their own submissions
    if (submission.user.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot rate your own submission'
      });
    }
    
    // Get the contest
    const contest = await Contest.findById(submission.contest);
    
    // Check if contest is completed
    if (contest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate submissions after contest deadline'
      });
    }
    
    // Update rating (simple average - in a real application, you would use a more sophisticated approach)
    const newRatingCount = submission.reviewCount + 1;
    const newRatingAvg = ((submission.rating * submission.reviewCount) + rating) / newRatingCount;
    
    submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { 
        rating: newRatingAvg,
        reviewCount: newRatingCount
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
