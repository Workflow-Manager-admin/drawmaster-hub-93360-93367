const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  rules: {
    type: String,
    required: [true, 'Please add contest rules']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'Deadline must be after the start date'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  prizes: [{
    rank: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  categories: [String],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  winnerAnnounced: {
    type: Boolean,
    default: false
  },
  winningSubmissions: [{
    rank: Number,
    submission: {
      type: mongoose.Schema.ObjectId,
      ref: 'Submission'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with submissions
ContestSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'contest',
  justOne: false
});

// Update status based on dates
ContestSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now > this.deadline) {
    this.status = 'completed';
  } else if (now > this.startDate && now < this.deadline) {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Contest', ContestSchema);
