const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  publishResult,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('student'), upload.single('document'), createRegistration);
router.get('/me', protect, authorize('student'), getMyRegistrations);
router.get('/', protect, authorize('admin'), getAllRegistrations);
router.get('/:id', protect, getRegistrationById);
router.put('/:id/status', protect, authorize('admin'), updateRegistrationStatus);
router.put('/:id/result', protect, authorize('admin'), publishResult);

module.exports = router;
