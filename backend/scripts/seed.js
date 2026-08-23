// Seeds an admin user and a couple of sample exams.
// Usage: node scripts/seed.js
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Exam = require('../models/Exam');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin',
    });
    console.log('Created admin user: admin@example.com / Admin@123');
  } else {
    console.log('Admin user already exists');
  }

  const examCount = await Exam.countDocuments();
  if (examCount === 0) {
    await Exam.insertMany([
      {
        title: 'Mathematics Aptitude Test',
        subject: 'Mathematics',
        description: 'Covers algebra, calculus and statistics fundamentals.',
        examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        fee: 500,
        totalSeats: 100,
        availableSeats: 100,
        slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'],
        center: 'Main Campus - Block A',
        createdBy: admin._id,
      },
      {
        title: 'General Science Entrance',
        subject: 'Science',
        description: 'Physics, Chemistry and Biology basics.',
        examDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        fee: 650,
        totalSeats: 80,
        availableSeats: 80,
        slots: ['10:00 AM - 01:00 PM'],
        center: 'Main Campus - Block B',
        createdBy: admin._id,
      },
      {
        title: 'English Proficiency Test',
        subject: 'English',
        description: 'Grammar, comprehension and writing skills assessment.',
        examDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        fee: 350,
        totalSeats: 60,
        availableSeats: 60,
        slots: ['09:00 AM - 11:00 AM', '03:00 PM - 05:00 PM'],
        center: 'Main Campus - Block C',
        createdBy: admin._id,
      },
    ]);
    console.log('Seeded 3 sample exams');
  } else {
    console.log('Exams already exist, skipping exam seed');
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
