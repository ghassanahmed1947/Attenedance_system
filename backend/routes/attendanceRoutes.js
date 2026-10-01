const express = require('express');
const router = express.Router();
const { signIn, signOut, getRecords, getStatus } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/signin', protect, authorize('employee', 'manager', 'developer'), signIn);
router.post('/signout', protect, authorize('employee', 'manager', 'developer'), signOut);
router.get('/status', protect, authorize('employee', 'manager', 'developer'), getStatus);
router.get('/records', protect, authorize('manager'), getRecords);

module.exports = router;