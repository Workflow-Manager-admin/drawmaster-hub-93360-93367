const express = require('express');
const router = express.Router();
const contestController = require('../../controllers/contestController');
const { protect, authorize } = require('../../middleware/auth');

// Routes for /api/contests
router.get('/', contestController.getContests);
router.get('/:id', contestController.getContest);
router.post('/', protect, authorize('admin'), contestController.createContest);
router.put('/:id', protect, authorize('admin'), contestController.updateContest);
router.delete('/:id', protect, authorize('admin'), contestController.deleteContest);
router.put('/:id/announce-winners', protect, authorize('admin'), contestController.announceWinners);

module.exports = router;
