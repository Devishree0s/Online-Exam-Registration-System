import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Online Exam Registration</Link>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-link">Sign Up</Link>
          </>
        )}
        {user && user.role === 'student' && (
          <>
            <Link to="/exams">Exams</Link>
            <Link to="/my-registrations">My Registrations</Link>
          </>
        )}
        {user && user.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/exams">Manage Exams</Link>
            <Link to="/admin/registrations">Registrations</Link>
          </>
        )}
        {user && (
          <span className="nav-user">
            {user.name} ({user.role})
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
