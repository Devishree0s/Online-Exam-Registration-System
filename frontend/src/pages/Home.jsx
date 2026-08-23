import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="hero card">
      <h1>Online Exam Registration System</h1>
      <p>
        Register for exams, upload verification documents, pick your slot, pay securely,
        and track your registration status — all in one place.
      </p>
      {!user && (
        <div className="hero-actions">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      )}
      {user && user.role === 'student' && (
        <div className="hero-actions">
          <Link to="/exams" className="btn-primary">Browse Exams</Link>
          <Link to="/my-registrations" className="btn-secondary">My Registrations</Link>
        </div>
      )}
      {user && user.role === 'admin' && (
        <div className="hero-actions">
          <Link to="/admin" className="btn-primary">Go to Dashboard</Link>
        </div>
      )}

      <div className="feature-grid">
        <div className="feature">
          <h3>Role-based Access</h3>
          <p>Students register and track applications; admins manage exams and approvals.</p>
        </div>
        <div className="feature">
          <h3>Document Upload</h3>
          <p>Upload ID proof or certificates directly during registration.</p>
        </div>
        <div className="feature">
          <h3>Slot Selection</h3>
          <p>Choose your preferred exam date, time slot, and center.</p>
        </div>
        <div className="feature">
          <h3>Secure Payments</h3>
          <p>Pay registration fees online and get an instant digital receipt.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
