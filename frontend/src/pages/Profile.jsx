import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Profile() {
  const { user } = useAuth();
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pass.new !== pass.confirm) { setMsg({ type: 'error', text: 'New passwords do not match' }); return; }
    setMsg({ type: '', text: '' });
    setLoading(true);
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pass.current, newPassword: pass.new }),
      });
      setMsg({ type: 'success', text: 'Password updated.' });
      setPass({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.data?.error || err.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>Profile</h1>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phone}</p>
        <p><strong>Exam:</strong> {user?.competitiveExam}</p>
      </div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Change password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current password</label>
            <input type="password" value={pass.current} onChange={(e) => setPass((p) => ({ ...p, current: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input type="password" value={pass.new} onChange={(e) => setPass((p) => ({ ...p, new: e.target.value }))} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input type="password" value={pass.confirm} onChange={(e) => setPass((p) => ({ ...p, confirm: e.target.value }))} required minLength={6} />
          </div>
          {msg.text && <p className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
