const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    dob: { type: Date, required: true },
    slot: { type: String, required: true },
    documentPath: { type: String, required: true },
    rollNumber: { type: String, unique: true, sparse: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentId: { type: String },
    paymentMethod: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminRemarks: { type: String, default: '' },
    result: {
      published: { type: Boolean, default: false },
      score: { type: Number },
      remarks: { type: String },
    },
  },
  { timestamps: true }
);

// A student can register for the same exam only once
registrationSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
