const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  contest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contest',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one submission per contest
SubmissionSchema.index({ contest: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
