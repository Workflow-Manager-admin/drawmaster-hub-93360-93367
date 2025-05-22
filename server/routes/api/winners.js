const express = require('express');
const router = express.Router();
const winnerController = require('../../controllers/winnerController');
const { protect, authorize } = require('../../middleware/auth');

// Routes for /api/winners
router.post('/', protect, authorize('admin'), winnerController.selectWinner);
router.get('/:contestId', winnerController.getWinnersByContest);

module.exports = router;
