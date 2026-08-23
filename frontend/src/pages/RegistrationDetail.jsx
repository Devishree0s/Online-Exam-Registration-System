import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const RegistrationDetail = () => {
  const { id } = useParams();
  const [reg, setReg] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/registrations/${id}`);
        setReg(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load registration');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!reg) return null;

  return (
    <div className="card">
      <h2>Registration Details</h2>
      <ul className="receipt">
        <li><strong>Exam:</strong> {reg.exam?.title} ({reg.exam?.subject})</li>
        <li><strong>Center:</strong> {reg.exam?.center}</li>
        <li><strong>Slot:</strong> {reg.slot}</li>
        <li><strong>Student:</strong> {reg.student?.name} — {reg.student?.email}</li>
        <li><strong>Roll Number:</strong> {reg.rollNumber || 'Not yet assigned (pending approval)'}</li>
        <li><strong>Status:</strong> <StatusBadge value={reg.status} /></li>
        <li><strong>Payment:</strong> <StatusBadge value={reg.paymentStatus} /> {reg.paymentId && `(${reg.paymentId})`}</li>
        {reg.adminRemarks && <li><strong>Admin Remarks:</strong> {reg.adminRemarks}</li>}
        <li><strong>Document:</strong> <a href={reg.documentPath} target="_blank" rel="noreferrer">View uploaded document</a></li>
        {reg.result?.published && (
          <>
            <li><strong>Result Score:</strong> {reg.result.score}</li>
            <li><strong>Result Remarks:</strong> {reg.result.remarks}</li>
          </>
        )}
      </ul>
      <Link to="/my-registrations" className="btn-secondary">Back</Link>
    </div>
  );
};

export default RegistrationDetail;
