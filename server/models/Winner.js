const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
  contest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contest',
    required: true
  },
  submission: {
    type: mongoose.Schema.ObjectId,
    ref: 'Submission',
    required: true
  },
  rank: {
    type: Number,
    required: [true, 'Please specify the rank (1st, 2nd, 3rd, etc.)'],
    min: [1, 'Rank must be at least 1']
  },
  selectedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  announcedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate ranks for the same contest
WinnerSchema.index({ contest: 1, rank: 1 }, { unique: true });

// Prevent the same submission from winning multiple times in the same contest
WinnerSchema.index({ contest: 1, submission: 1 }, { unique: true });

module.exports = mongoose.model('Winner', WinnerSchema);
