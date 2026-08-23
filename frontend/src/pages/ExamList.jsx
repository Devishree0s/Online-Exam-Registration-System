import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/exams');
        setExams(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <div className="page-loading">Loading exams...</div>;

  return (
    <div>
      <h2>Available Exams</h2>
      {error && <div className="alert-error">{error}</div>}
      <div className="grid-cards">
        {exams.map((exam) => {
          const deadlinePassed = new Date() > new Date(exam.registrationDeadline);
          const full = exam.availableSeats <= 0;
          return (
            <div className="card exam-card" key={exam._id}>
              <h3>{exam.title}</h3>
              <p className="muted">{exam.subject} &middot; {exam.center}</p>
              <p>{exam.description}</p>
              <ul className="exam-meta">
                <li><strong>Exam Date:</strong> {formatDate(exam.examDate)}</li>
                <li><strong>Register By:</strong> {formatDate(exam.registrationDeadline)}</li>
                <li><strong>Fee:</strong> ₹{exam.fee}</li>
                <li><strong>Seats Left:</strong> {exam.availableSeats} / {exam.totalSeats}</li>
              </ul>
              {deadlinePassed || full ? (
                <button className="btn-secondary" disabled>
                  {full ? 'Seats Full' : 'Registration Closed'}
                </button>
              ) : (
                <Link to={`/exams/${exam._id}/register`} className="btn-primary">Register</Link>
              )}
            </div>
          );
        })}
        {exams.length === 0 && <p>No exams available right now. Please check back later.</p>}
      </div>
    </div>
  );
};

export default ExamList;
