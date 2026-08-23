const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    examDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    fee: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    slots: [{ type: String }], // e.g. ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"]
    center: { type: String, default: 'Main Campus' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
