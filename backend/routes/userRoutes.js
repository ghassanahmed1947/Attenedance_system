const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('manager'), createUser);
router.get('/', protect, authorize('manager'), getUsers);
router.put('/:id', protect, authorize('manager'), updateUser);
router.delete('/:id', protect, authorize('manager'), deleteUser);

module.exports = router;