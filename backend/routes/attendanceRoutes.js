const express = require('express');
const router = express.Router();
const { signIn, signOut, getAllAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/signin', protect, authorize('employee'), signIn);
router.post('/signout', protect, authorize('employee'), signOut);
router.get('/', protect, authorize('manager'), getAllAttendance);

module.exports = router;