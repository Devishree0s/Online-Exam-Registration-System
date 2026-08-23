const Registration = require('../models/Registration');
const Exam = require('../models/Exam');
const User = require('../models/User');

// @desc Get dashboard statistics
// @route GET /api/admin/stats
// @access Private/Admin
const getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalExams, totalRegistrations, pendingApprovals, approved, rejected, paidAgg] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        Exam.countDocuments({}),
        Registration.countDocuments({}),
        Registration.countDocuments({ status: 'pending' }),
        Registration.countDocuments({ status: 'approved' }),
        Registration.countDocuments({ status: 'rejected' }),
        Registration.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $lookup: { from: 'exams', localField: 'exam', foreignField: '_id', as: 'examData' } },
          { $unwind: '$examData' },
          { $group: { _id: null, total: { $sum: '$examData.fee' }, count: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      totalStudents,
      totalExams,
      totalRegistrations,
      pendingApprovals,
      approved,
      rejected,
      totalRevenue: paidAgg[0]?.total || 0,
      paidCount: paidAgg[0]?.count || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
