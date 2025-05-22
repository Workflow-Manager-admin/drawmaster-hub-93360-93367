const express = require('express');
const router = express.Router();
const submissionController = require('../../controllers/submissionController');
const { protect, authorize } = require('../../middleware/auth');

// Routes for /api/submissions
router.get('/', protect, submissionController.getSubmissions);
router.get('/:id', submissionController.getSubmission);
router.post('/', protect, submissionController.createSubmission);
router.put('/:id', protect, submissionController.updateSubmission);
router.delete('/:id', protect, submissionController.deleteSubmission);
router.get('/contest/:contestId', submissionController.getSubmissionsByContest);

// Admin routes
router.put('/:id/status', protect, authorize('admin'), submissionController.updateSubmissionStatus);
router.put('/:id/rate', protect, submissionController.rateSubmission);

module.exports = router;
