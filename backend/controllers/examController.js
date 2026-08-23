const Exam = require('../models/Exam');

// @desc Get all active exams (public list for students), or all for admin
// @route GET /api/exams
// @access Public
const getExams = async (req, res, next) => {
  try {
    const filter = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    const exams = await Exam.find(filter).sort({ examDate: 1 });
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// @desc Get single exam
// @route GET /api/exams/:id
// @access Public
const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    next(error);
  }
};

// @desc Create exam
// @route POST /api/exams
// @access Private/Admin
const createExam = async (req, res, next) => {
  try {
    const { title, subject, description, examDate, registrationDeadline, fee, totalSeats, slots, center } = req.body;

    if (!title || !subject || !examDate || !registrationDeadline || fee === undefined || !totalSeats) {
      return res.status(400).json({ message: 'Please provide all required exam fields' });
    }

    const exam = await Exam.create({
      title,
      subject,
      description,
      examDate,
      registrationDeadline,
      fee,
      totalSeats,
      availableSeats: totalSeats,
      slots: slots && slots.length ? slots : ['09:00 AM - 12:00 PM'],
      center: center || 'Main Campus',
      createdBy: req.user._id,
    });

    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
};

// @desc Update exam
// @route PUT /api/exams/:id
// @access Private/Admin
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const updatableFields = [
      'title', 'subject', 'description', 'examDate', 'registrationDeadline',
      'fee', 'totalSeats', 'slots', 'center', 'isActive',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) exam[field] = req.body[field];
    });

    // Keep availableSeats in sync if totalSeats increased/decreased
    if (req.body.totalSeats !== undefined) {
      const seatsUsed = exam.totalSeats - exam.availableSeats;
      exam.availableSeats = Math.max(0, req.body.totalSeats - seatsUsed);
    }

    await exam.save();
    res.json(exam);
  } catch (error) {
    next(error);
  }
};

// @desc Delete exam
// @route DELETE /api/exams/:id
// @access Private/Admin
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.deleteOne();
    res.json({ message: 'Exam removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExams, getExamById, createExam, updateExam, deleteExam };
