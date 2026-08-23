import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  title: '', subject: '', description: '', examDate: '', registrationDeadline: '',
  fee: '', totalSeats: '', center: '', slots: '09:00 AM - 12:00 PM',
};

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchExams(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      fee: Number(form.fee),
      totalSeats: Number(form.totalSeats),
      slots: form.slots.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/exams/${editingId}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      resetForm();
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setForm({
      title: exam.title,
      subject: exam.subject,
      description: exam.description || '',
      examDate: exam.examDate?.slice(0, 10),
      registrationDeadline: exam.registrationDeadline?.slice(0, 10),
      fee: exam.fee,
      totalSeats: exam.totalSeats,
      center: exam.center,
      slots: exam.slots.join(', '),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam? This cannot be undone.')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const toggleActive = async (exam) => {
    try {
      await api.put(`/exams/${exam._id}`, { isActive: !exam.isActive });
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update exam');
    }
  };

  return (
    <div>
      <h2>Manage Exams</h2>
      {error && <div className="alert-error">{error}</div>}

      <div className="card form-card">
        <h3>{editingId ? 'Edit Exam' : 'Create New Exam'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />

          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} />

          <label>Exam Date</label>
          <input type="date" name="examDate" value={form.examDate} onChange={handleChange} required />

          <label>Registration Deadline</label>
          <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required />

          <label>Fee (₹)</label>
          <input type="number" name="fee" value={form.fee} onChange={handleChange} min="0" required />

          <label>Total Seats</label>
          <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange} min="1" required />

          <label>Center</label>
          <input name="center" value={form.center} onChange={handleChange} placeholder="Main Campus" required />

          <label>Slots (comma-separated)</label>
          <input name="slots" value={form.slots} onChange={handleChange} placeholder="09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM" required />

          <div className="wizard-actions">
            <button type="submit" className="btn-primary">{editingId ? 'Update Exam' : 'Create Exam'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th><th>Subject</th><th>Fee</th><th>Seats</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.title}</td>
                <td>{exam.subject}</td>
                <td>₹{exam.fee}</td>
                <td>{exam.availableSeats}/{exam.totalSeats}</td>
                <td>{exam.isActive ? 'Yes' : 'No'}</td>
                <td className="action-cell">
                  <button className="btn-link" onClick={() => handleEdit(exam)}>Edit</button>
                  <button className="btn-link" onClick={() => toggleActive(exam)}>
                    {exam.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-link danger" onClick={() => handleDelete(exam._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminExams;
