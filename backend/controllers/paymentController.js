const Registration = require('../models/Registration');

// @desc Mock payment processor - simulates a payment gateway transaction
// @route POST /api/payments/pay
// @access Private/Student
const makePayment = async (req, res, next) => {
  try {
    const { registrationId, method } = req.body;

    if (!registrationId || !method) {
      return res.status(400).json({ message: 'Please provide registration id and payment method' });
    }

    const registration = await Registration.findById(registrationId).populate('exam', 'fee title');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this registration' });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This registration is already paid for' });
    }

    // Simulate a payment gateway call (always succeeds in this demo)
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    registration.paymentStatus = 'paid';
    registration.paymentId = transactionId;
    registration.paymentMethod = method;
    await registration.save();

    res.json({
      message: 'Payment successful',
      transactionId,
      amountPaid: registration.exam.fee,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { makePayment };
