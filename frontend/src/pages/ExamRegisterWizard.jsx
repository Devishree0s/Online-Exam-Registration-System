import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const STEPS = ['Details & Document', 'Slot Selection', 'Payment', 'Confirmation'];

const ExamRegisterWizard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [dob, setDob] = useState('');
  const [document, setDocument] = useState(null);
  const [slot, setSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [payDetail, setPayDetail] = useState('');

  const [registration, setRegistration] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await api.get(`/exams/${examId}`);
        setExam(data);
        if (data.slots?.length) setSlot(data.slots[0]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleDetailsNext = (e) => {
    e.preventDefault();
    setError('');
    if (!dob) return setError('Please enter your date of birth');
    if (!document) return setError('Please upload a required document (ID proof / certificate)');
    goNext();
  };

  const handleSlotNext = (e) => {
    e.preventDefault();
    setError('');
    if (!slot) return setError('Please select a slot');
    goNext();
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('examId', examId);
      formData.append('dob', dob);
      formData.append('slot', slot);
      formData.append('document', document);

      const { data: reg } = await api.post('/registrations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRegistration(reg);

      const { data: paymentResult } = await api.post('/payments/pay', {
        registrationId: reg._id,
        method: paymentMethod,
      });
      setReceipt(paymentResult);
      goNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!exam) return <div className="alert-error">{error || 'Exam not found'}</div>;

  return (
    <div className="card form-card wizard">
      <h2>Register: {exam.title}</h2>

      <div className="stepper">
        {STEPS.map((label, idx) => (
          <div key={label} className={`stepper-item ${idx === step ? 'active' : ''} ${idx < step ? 'done' : ''}`}>
            <span className="stepper-dot">{idx + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {step === 0 && (
        <form onSubmit={handleDetailsNext}>
          <h3>Step 1: Personal Details & Document Upload</h3>
          <label>Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />

          <label>Upload ID Proof / Certificate (PDF, JPG, PNG — max 5MB)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setDocument(e.target.files[0])}
            required
          />

          <div className="wizard-actions">
            <button type="submit" className="btn-primary">Next</button>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleSlotNext}>
          <h3>Step 2: Exam Slot Selection</h3>
          <p className="muted">Center: {exam.center}</p>
          <label>Select Slot</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} required>
            {exam.slots.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={goPrev}>Previous</button>
            <button type="submit" className="btn-primary">Next</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitRegistration}>
          <h3>Step 3: Payment</h3>
          <p>Amount Payable: <strong>₹{exam.fee}</strong></p>

          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
          </select>

          <label>Card / UPI ID (demo only — not processed for real)</label>
          <input
            type="text"
            value={payDetail}
            onChange={(e) => setPayDetail(e.target.value)}
            placeholder="e.g. 1234 5678 9012 3456 or name@upi"
            required
          />

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={goPrev} disabled={submitting}>Previous</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : `Pay ₹${exam.fee} & Submit`}
            </button>
          </div>
        </form>
      )}

      {step === 3 && registration && (
        <div>
          <h3>Step 4: Registration Confirmed</h3>
          <div className="alert-success">
            Registration successful! A confirmation would normally be emailed to you.
          </div>
          <ul className="receipt">
            <li><strong>Exam:</strong> {exam.title}</li>
            <li><strong>Slot:</strong> {registration.slot}</li>
            <li><strong>Status:</strong> {registration.status} (pending admin approval)</li>
            <li><strong>Payment:</strong> {receipt?.transactionId} — ₹{receipt?.amountPaid} paid</li>
          </ul>
          <div className="wizard-actions">
            <Link to="/my-registrations" className="btn-primary">View My Registrations</Link>
            <button className="btn-secondary" onClick={() => navigate('/exams')}>Browse More Exams</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRegisterWizard;
