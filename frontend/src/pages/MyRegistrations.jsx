import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/registrations/me');
        setRegistrations(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div>
      <h2>My Registrations</h2>
      {error && <div className="alert-error">{error}</div>}
      {registrations.length === 0 && <p>You haven't registered for any exams yet. <Link to="/exams">Browse exams</Link>.</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Slot</th>
            <th>Roll No.</th>
            <th>Status</th>
            <th>Payment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r._id}>
              <td>{r.exam?.title}</td>
              <td>{r.slot}</td>
              <td>{r.rollNumber || '—'}</td>
              <td><StatusBadge value={r.status} /></td>
              <td><StatusBadge value={r.paymentStatus} /></td>
              <td><Link to={`/registrations/${r._id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyRegistrations;
