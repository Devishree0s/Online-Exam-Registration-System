import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ExamList from './pages/ExamList';
import ExamRegisterWizard from './pages/ExamRegisterWizard';
import MyRegistrations from './pages/MyRegistrations';
import RegistrationDetail from './pages/RegistrationDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminExams from './pages/admin/AdminExams';
import AdminRegistrations from './pages/admin/AdminRegistrations';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/exams"
            element={
              <ProtectedRoute role="student">
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:examId/register"
            element={
              <ProtectedRoute role="student">
                <ExamRegisterWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute role="student">
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrations/:id"
            element={
              <ProtectedRoute>
                <RegistrationDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute role="admin">
                <AdminExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <ProtectedRoute role="admin">
                <AdminRegistrations />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div className="card">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
