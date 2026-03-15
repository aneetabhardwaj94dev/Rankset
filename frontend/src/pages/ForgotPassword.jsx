import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setDone(true);
    } catch (err) {
      setError(err.data?.error || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AdPlaceholder position="top" />
      <div className="container" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <div className="card">
          <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Recover password</h1>
          {done ? (
            <p className="success-msg">If this email is registered, you will receive a password reset link. Check your inbox and spam.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
      <AdPlaceholder position="bottom" />
    </div>
  );
}
