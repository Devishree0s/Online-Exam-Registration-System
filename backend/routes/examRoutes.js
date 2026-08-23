const express = require('express');
const router = express.Router();
const { getExams, getExamById, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getExams);
router.get('/:id', getExamById);
router.post('/', protect, authorize('admin'), createExam);
router.put('/:id', protect, authorize('admin'), updateExam);
router.delete('/:id', protect, authorize('admin'), deleteExam);

module.exports = router;
