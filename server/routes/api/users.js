const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect, authorize } = require('../../middleware/auth');

// Routes for /api/users
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', protect, userController.getMe);
router.put('/updatedetails', protect, userController.updateDetails);
router.put('/updatepassword', protect, userController.updatePassword);

// Admin only routes
router.get('/', protect, authorize('admin'), userController.getUsers);

module.exports = router;
