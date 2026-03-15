import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setError('Invalid reset link'); return; }
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
      setDone(true);
    } catch (err) {
      setError(err.data?.error || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AdPlaceholder position="top" />
      <div className="container" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <div className="card">
          <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Set new password</h1>
          {done ? (
            <p className="success-msg">Password updated. <Link to="/login">Login here</Link>.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New password (min 6 characters)</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading || !token}>
                {loading ? 'Updating...' : 'Update password'}
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
