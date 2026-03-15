import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    competitiveExam: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-wrap">
            <img src="/logo.png" alt="Rankset" className="logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.add('show'); }} />
            <span className="logo-text">Rankset</span>
          </Link>
        </div>
      </header>
      <AdPlaceholder position="top" />
      <div className="container" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <div className="card">
          <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Create account - Rankset</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input name="fatherName" value={form.fatherName} onChange={handleChange} required placeholder="Father's name" />
            </div>
            <div className="form-group">
              <label>Competitive Exam</label>
              <input name="competitiveExam" value={form.competitiveExam} onChange={handleChange} required placeholder="e.g. NEET, JEE, SSC" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" />
            </div>
            <div className="form-group">
              <label>Password (min 6 characters)</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="••••••••" />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      <AdPlaceholder position="bottom" />
    </div>
  );
}
