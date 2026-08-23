# Online Exam Registration System (MERN Stack)

A full-stack web application for online exam registration, built with **MongoDB, Express.js, React.js (Vite), and Node.js**, based on the accompanying project report (SRS, use case, and workflow diagrams).

## Features

**Students**
- Register / login (JWT auth, hashed passwords)
- Browse active exams (fee, seats, dates, center)
- 4-step registration wizard: personal details + document upload → slot selection → payment → confirmation
- View "My Registrations" with live status (pending / approved / rejected) and payment status
- View registration receipt, uploaded document, roll number, and published results

**Admins**
- Dashboard with stats: total students, exams, registrations, pending approvals, revenue
- Full exam CRUD (create/edit/activate-deactivate/delete, seats, slots, fee, deadlines)
- View/search/filter all registrations by status or keyword
- Approve or reject registrations (auto-generates roll number on approval, frees the seat on rejection)
- Publish results (score + remarks) per registration

**Core mechanics**
- Role-based access control (student / admin) via JWT + middleware
- Document upload handled with Multer (PDF/JPG/PNG, 5MB limit), served statically
- Mock payment gateway (simulates a transaction ID; swap in Stripe/Razorpay for production — see "Going to production" below)
- One registration per student per exam enforced at the database level

## Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | React 18, Vite, React Router 6, Axios         |
| Backend   | Node.js, Express 4                            |
| Database  | MongoDB + Mongoose 8                          |
| Auth      | JWT (jsonwebtoken) + bcryptjs                 |
| Uploads   | Multer                                        |

## Project Structure

```
exam-registration-system/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # User, Exam, Registration schemas
│   ├── middleware/                  # auth, role-check, file upload, error handling
│   ├── controllers/                 # business logic
│   ├── routes/                      # /api/auth, /api/exams, /api/registrations, /api/payments, /api/admin
│   ├── scripts/seed.js              # creates demo admin + sample exams
│   ├── uploads/                     # uploaded documents (created automatically)
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js             # pre-configured axios instance (attaches JWT)
    │   ├── context/AuthContext.jsx
    │   ├── components/              # Navbar, ProtectedRoute, StatusBadge
    │   ├── pages/                   # Home, Login, Register, ExamList, wizard, My Registrations...
    │   └── pages/admin/             # Dashboard, Manage Exams, Manage Registrations
    ├── .env.example
    └── vite.config.js
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas cluster

Don't have MongoDB installed locally? Easiest options:
- Install locally: https://www.mongodb.com/docs/manual/administration/install-community/
- Or create a free cloud cluster at https://www.mongodb.com/cloud/atlas/register and use its connection string instead

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if needed (defaults work for a local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/exam_registration
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed a demo admin account and sample exams (optional but recommended):
```bash
node scripts/seed.js
```
This creates: **admin@example.com / Admin@123** and 3 sample exams.

Start the backend:
```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```
The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 2. Frontend

In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The app runs at `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend automatically (see `vite.config.js`).

### 3. Try it out

1. Open `http://localhost:5173`
2. Sign up as a student, or log in as the seeded admin (`admin@example.com` / `Admin@123`)
3. As a student: browse exams → register (upload any PDF/image as the "document") → pick a slot → pay (mock) → see confirmation
4. As admin: go to **Manage Registrations** to approve/reject and publish results, or **Manage Exams** to add/edit exams

## API Overview

| Method | Endpoint                          | Access        | Description                          |
|--------|------------------------------------|---------------|---------------------------------------|
| POST   | /api/auth/register                 | Public        | Create account                        |
| POST   | /api/auth/login                    | Public        | Login, returns JWT                    |
| GET    | /api/auth/me                       | Private       | Current user profile                  |
| GET    | /api/exams                         | Public        | List active exams (all, if admin)     |
| GET    | /api/exams/:id                     | Public        | Exam detail                           |
| POST   | /api/exams                         | Admin         | Create exam                           |
| PUT    | /api/exams/:id                     | Admin         | Update exam                           |
| DELETE | /api/exams/:id                     | Admin         | Delete exam                           |
| POST   | /api/registrations                 | Student       | Register for exam (multipart, doc)    |
| GET    | /api/registrations/me              | Student       | My registrations                      |
| GET    | /api/registrations                 | Admin         | All registrations (filter/search)     |
| GET    | /api/registrations/:id             | Owner/Admin   | Single registration                   |
| PUT    | /api/registrations/:id/status      | Admin         | Approve / reject                      |
| PUT    | /api/registrations/:id/result      | Admin         | Publish result                        |
| POST   | /api/payments/pay                  | Student       | Mock payment for a registration       |
| GET    | /api/admin/stats                   | Admin         | Dashboard statistics                  |

## Going to production

This build is fully functional for demo/academic purposes. Before real-world deployment, consider:
- Swap the mock payment endpoint for a real gateway (Stripe, Razorpay, PayPal) using their SDKs and webhook verification
- Add email/SMS notifications (e.g., Nodemailer + a transactional email provider) on registration, approval, and payment events
- Move uploaded documents to cloud storage (S3, Cloudinary) instead of local disk
- Add HTTPS, rate limiting, and helmet.js security headers
- Add automated tests (Jest/Supertest for backend, React Testing Library for frontend)
- Containerize with Docker and deploy behind a reverse proxy (Nginx) as outlined in your report's SCM section

## Notes

- Registering a second time for the same exam with the same account is blocked at the database level (unique index on student+exam).
- Rejecting a registration automatically frees up the seat it held.
- Approving a registration automatically generates a roll number if one doesn't already exist.
