import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <div className="alert-error">{error}</div>}
      {!stats ? (
        <p>Loading stats...</p>
      ) : (
        <div className="stat-grid">
          <div className="stat-card"><h3>{stats.totalStudents}</h3><p>Students</p></div>
          <div className="stat-card"><h3>{stats.totalExams}</h3><p>Exams</p></div>
          <div className="stat-card"><h3>{stats.totalRegistrations}</h3><p>Total Registrations</p></div>
          <div className="stat-card"><h3>{stats.pendingApprovals}</h3><p>Pending Approvals</p></div>
          <div className="stat-card"><h3>{stats.approved}</h3><p>Approved</p></div>
          <div className="stat-card"><h3>{stats.rejected}</h3><p>Rejected</p></div>
          <div className="stat-card"><h3>{stats.paidCount}</h3><p>Payments Completed</p></div>
          <div className="stat-card"><h3>₹{stats.totalRevenue}</h3><p>Total Revenue</p></div>
        </div>
      )}
      <div className="hero-actions" style={{ marginTop: '2rem' }}>
        <Link to="/admin/exams" className="btn-primary">Manage Exams</Link>
        <Link to="/admin/registrations" className="btn-secondary">View Registrations</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
