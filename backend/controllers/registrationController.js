const Registration = require('../models/Registration');
const Exam = require('../models/Exam');
const path = require('path');

const generateRollNumber = (examId) => {
  const shortExamId = examId.toString().slice(-4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EX-${shortExamId}-${random}`;
};

// @desc Create a new exam registration (student)
// @route POST /api/registrations
// @access Private/Student
const createRegistration = async (req, res, next) => {
  try {
    const { examId, dob, slot } = req.body;

    if (!examId || !dob || !slot) {
      return res.status(400).json({ message: 'Please provide exam, date of birth, and slot' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a required document (ID proof / certificate)' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (!exam.isActive) return res.status(400).json({ message: 'This exam is not open for registration' });
    if (new Date() > new Date(exam.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed for this exam' });
    }
    if (exam.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available for this exam' });
    }
    if (!exam.slots.includes(slot)) {
      return res.status(400).json({ message: 'Invalid slot selected' });
    }

    const existing = await Registration.findOne({ student: req.user._id, exam: examId });
    if (existing) {
      return res.status(400).json({ message: 'You have already registered for this exam' });
    }

    const registration = await Registration.create({
      student: req.user._id,
      exam: examId,
      dob,
      slot,
      documentPath: `/uploads/${req.file.filename}`,
    });

    exam.availableSeats -= 1;
    await exam.save();

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already registered for this exam' });
    }
    next(error);
  }
};

// @desc Get logged-in student's registrations
// @route GET /api/registrations/me
// @access Private/Student
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('exam', 'title subject examDate fee center')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// @desc Get all registrations (admin) with optional filters: status, paymentStatus, examId, search
// @route GET /api/registrations
// @access Private/Admin
const getAllRegistrations = async (req, res, next) => {
  try {
    const { status, paymentStatus, examId, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (examId) filter.exam = examId;

    let registrations = await Registration.find(filter)
      .populate('student', 'name email phone')
      .populate('exam', 'title subject examDate fee center')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      registrations = registrations.filter(
        (r) =>
          r.student?.name?.toLowerCase().includes(term) ||
          r.student?.email?.toLowerCase().includes(term) ||
          r.rollNumber?.toLowerCase().includes(term) ||
          r.exam?.title?.toLowerCase().includes(term)
      );
    }

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

// @desc Get a single registration by id
// @route GET /api/registrations/:id
// @access Private (owner or admin)
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate('exam', 'title subject examDate fee center slots');

    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (req.user.role !== 'admin' && registration.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this registration' });
    }

    res.json(registration);
  } catch (error) {
    next(error);
  }
};

// @desc Approve or reject a registration (admin)
// @route PUT /api/registrations/:id/status
// @access Private/Admin
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.status = status;
    if (adminRemarks !== undefined) registration.adminRemarks = adminRemarks;

    if (status === 'approved' && !registration.rollNumber) {
      registration.rollNumber = generateRollNumber(registration.exam);
    }

    // If rejected, free up the seat
    if (status === 'rejected') {
      const exam = await Exam.findById(registration.exam);
      if (exam) {
        exam.availableSeats += 1;
        await exam.save();
      }
    }

    await registration.save();
    res.json(registration);
  } catch (error) {
    next(error);
  }
};

// @desc Publish result for a registration (admin)
// @route PUT /api/registrations/:id/result
// @access Private/Admin
const publishResult = async (req, res, next) => {
  try {
    const { score, remarks } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.result = { published: true, score, remarks: remarks || '' };
    await registration.save();
    res.json(registration);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistration,
  getMyRegistrations,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  publishResult,
};
