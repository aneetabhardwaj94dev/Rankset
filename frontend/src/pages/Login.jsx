import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.data?.error || err.message || 'Login failed');
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
          <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Login - Rankset</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </form>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            New user? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
      <AdPlaceholder position="bottom" />
    </div>
  );
}
