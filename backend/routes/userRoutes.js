const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('developer', 'manager'), createUser);
router.get('/', protect, authorize('developer', 'manager'), getUsers);
router.put('/:id', protect, authorize('developer'), updateUser);
router.delete('/:id', protect, authorize('developer'), deleteUser);

module.exports = router;