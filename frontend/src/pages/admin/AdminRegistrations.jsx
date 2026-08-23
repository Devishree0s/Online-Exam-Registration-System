import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultDrafts, setResultDrafts] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/registrations', { params });
      setRegistrations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/registrations/${id}/status`, { status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const submitResult = async (id) => {
    const draft = resultDrafts[id];
    if (!draft || draft.score === undefined || draft.score === '') {
      setError('Please enter a score before publishing the result');
      return;
    }
    try {
      await api.put(`/registrations/${id}/result`, { score: Number(draft.score), remarks: draft.remarks || '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish result');
    }
  };

  const setDraft = (id, field, value) => {
    setResultDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div>
      <h2>Manage Registrations</h2>
      {error && <div className="alert-error">{error}</div>}

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by name, email, roll no, exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th><th>Exam</th><th>Slot</th><th>Payment</th><th>Status</th><th>Roll No.</th><th>Result</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name}<br /><span className="muted">{r.student?.email}</span></td>
                <td><Link to={`/registrations/${r._id}`}>{r.exam?.title}</Link></td>
                <td>{r.slot}</td>
                <td><StatusBadge value={r.paymentStatus} /></td>
                <td><StatusBadge value={r.status} /></td>
                <td>{r.rollNumber || '—'}</td>
                <td>
                  {r.result?.published ? (
                    <span>Score: {r.result.score}</span>
                  ) : (
                    <div className="result-input">
                      <input
                        type="number"
                        placeholder="Score"
                        style={{ width: '70px' }}
                        value={resultDrafts[r._id]?.score ?? ''}
                        onChange={(e) => setDraft(r._id, 'score', e.target.value)}
                      />
                      <button className="btn-link" onClick={() => submitResult(r._id)}>Publish</button>
                    </div>
                  )}
                </td>
                <td className="action-cell">
                  {r.status !== 'approved' && (
                    <button className="btn-link" onClick={() => updateStatus(r._id, 'approved')}>Approve</button>
                  )}
                  {r.status !== 'rejected' && (
                    <button className="btn-link danger" onClick={() => updateStatus(r._id, 'rejected')}>Reject</button>
                  )}
                  {r.status !== 'pending' && (
                    <button className="btn-link" onClick={() => updateStatus(r._id, 'pending')}>Reset</button>
                  )}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr><td colSpan={8}>No registrations found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRegistrations;
