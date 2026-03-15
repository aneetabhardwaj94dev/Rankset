import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, apiForm } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

const API = import.meta.env.VITE_API_URL || '';

function AdminNav() {
  const { user } = useAuth();
  const loc = useLocation();
  const base = '/admin';
  const links = [];
  if (user?.role === 'admin') {
    links.push({ to: base + '/users', label: 'Users' });
    links.push({ to: base + '/questions', label: 'Upload questions' });
    links.push({ to: base + '/bulk', label: 'Bulk CSV' });
  }
  links.push({ to: base + '/reports', label: 'Reports / Leaderboard' });
  return (
    <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      {links.map((l) => (
        <Link key={l.to} to={l.to} className={`btn ${loc.pathname === l.to ? 'btn-primary' : 'btn-outline'}`}>{l.label}</Link>
      ))}
    </nav>
  );
}

function UsersList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [exam, setExam] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    let q = `page=${page}&limit=20`;
    if (exam) q += `&exam=${encodeURIComponent(exam)}`;
    if (search) q += `&search=${encodeURIComponent(search)}`;
    api(`/api/admin/users?${q}`).then((r) => { setUsers(r.users); setTotal(r.total); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, exam]);
  useEffect(() => { const t = setTimeout(() => { if (page === 1) load(); }, 300); return () => clearTimeout(t); }, [search]);

  const exportCsv = () => {
    let q = '';
    if (exam) q += `&exam=${encodeURIComponent(exam)}`;
    window.open(`${API}/api/admin/users/export?${q}`, '_blank');
  };

  return (
    <div className="card">
      <h2>Manage users</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input placeholder="Search name/email/phone" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.5rem', flex: 1, minWidth: 160 }} />
        <input placeholder="Filter by exam" value={exam} onChange={(e) => setExam(e.target.value)} style={{ padding: '0.5rem', width: 140 }} />
        <button type="button" className="btn btn-primary" onClick={load}>Refresh</button>
        <button type="button" className="btn btn-outline" onClick={exportCsv}>Download CSV</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th><th>Email</th><th>Phone</th><th>Exam</th><th>Role</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.competitiveExam}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Total: {total}</p>
    </div>
  );
}

function UploadQuestion() {
  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState({ examId: '', chapterId: '', medium: 'en', questionText: '', correctOptionIndex: 0, option1: '', option2: '', option3: '', option4: '', explanation: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { api('/api/admin/exams').then((r) => setExams(r.exams)).catch(() => {}); }, []);
  useEffect(() => {
    if (!form.examId) { setChapters([]); return; }
    api('/api/admin/chapters').then((r) => setChapters(r.chapters.filter((c) => c.examId?._id === form.examId || c.examId === form.examId))).catch(() => setChapters([]));
  }, [form.examId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    const fd = new FormData();
    fd.append('examId', form.examId);
    fd.append('chapterId', form.chapterId);
    fd.append('medium', form.medium);
    fd.append('questionText', form.questionText);
    fd.append('correctOptionIndex', form.correctOptionIndex);
    fd.append('options', JSON.stringify([form.option1, form.option2, form.option3, form.option4].filter(Boolean).map((text, i) => ({ text, isCorrect: i === Number(form.correctOptionIndex) }))));
    fd.append('explanation', form.explanation);
    if (file) fd.append('questionImage', file);
    try {
      await apiForm('/api/admin/questions', fd);
      setMsg('Question added.');
      setForm((f) => ({ ...f, questionText: '', option1: '', option2: '', option3: '', option4: '', explanation: '' }));
      setFile(null);
    } catch (err) {
      setMsg(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload single question</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Exam</label>
          <select value={form.examId} onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))} required>
            <option value="">Select</option>
            {exams.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Chapter</label>
          <select value={form.chapterId} onChange={(e) => setForm((f) => ({ ...f, chapterId: e.target.value }))} required>
            <option value="">Select</option>
            {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Medium</label>
          <select value={form.medium} onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div className="form-group">
          <label>Question text (LaTeX allowed e.g. \( x^2 \))</label>
          <textarea value={form.questionText} onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))} rows={3} required />
        </div>
        <div className="form-group">
          <label>Question image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="form-group">
            <label>Option {i} {Number(form.correctOptionIndex) === i - 1 ? '(correct)' : ''}</label>
            <input value={form[`option${i}`]} onChange={(e) => setForm((f) => ({ ...f, [`option${i}`]: e.target.value }))} />
          </div>
        ))}
        <div className="form-group">
          <label>Correct option index (0-3)</label>
          <select value={form.correctOptionIndex} onChange={(e) => setForm((f) => ({ ...f, correctOptionIndex: e.target.value }))}>
            {[0, 1, 2, 3].map((i) => <option key={i} value={i}>{i + 1}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Explanation (optional)</label>
          <textarea value={form.explanation} onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))} rows={2} />
        </div>
        {msg && <p className={msg.startsWith('Question') ? 'success-msg' : 'error-msg'}>{msg}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Add question'}</button>
      </form>
    </div>
  );
}

function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append('csv', file);
    try {
      const r = await apiForm('/api/admin/questions/bulk', fd);
      setResult(`Inserted ${r.inserted} questions.`);
    } catch (err) {
      setResult('Error: ' + (err.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card">
      <h2>Bulk upload (CSV)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>CSV columns: examId, chapterId, medium, questionText or question, option1..option4, correctOptionIndex or correct_index (0-3), explanation (optional).</p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0])} required />
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>{loading ? 'Uploading...' : 'Upload CSV'}</button>
      </form>
      {result && <p className="success-msg" style={{ marginTop: '0.5rem' }}>{result}</p>}
    </div>
  );
}

function Reports() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [examId, setExamId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api('/api/exams').then((r) => setExams(r.exams)).catch(() => {}); }, []);
  useEffect(() => {
    if (!examId) { setChapters([]); return; }
    api(`/api/exams/${examId}/chapters`).then((r) => setChapters(r.chapters)).catch(() => setChapters([]));
  }, [examId]);

  const load = () => {
    if (!examId) return;
    setLoading(true);
    let q = `examId=${examId}`;
    if (chapterId) q += `&chapterId=${chapterId}`;
    if (phone) q += `&phone=${encodeURIComponent(phone)}`;
    if (email) q += `&email=${encodeURIComponent(email)}`;
    api(`/api/reports/leaderboard?${q}`).then((r) => setData(r.data)).catch(() => setData([])).finally(() => setLoading(false));
  };

  const downloadCsv = () => {
    if (!examId) return;
    let q = `examId=${examId}&format=csv`;
    if (chapterId) q += `&chapterId=${chapterId}`;
    if (phone) q += `&phone=${encodeURIComponent(phone)}`;
    if (email) q += `&email=${encodeURIComponent(email)}`;
    window.open(`${API}/api/reports/leaderboard?${q}`, '_blank');
  };

  return (
    <div className="card">
      <h2>Leaderboard / Rank report</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Filter by exam, chapter (optional), phone, email. Managers can only view and download reports.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <select value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">Select exam</option>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
          <option value="">All chapters</option>
          {chapters.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input placeholder="Phone filter" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '0.5rem', width: 140 }} />
        <input placeholder="Email filter" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.5rem', width: 160 }} />
        <button type="button" className="btn btn-primary" onClick={load} disabled={!examId}>Load</button>
        <button type="button" className="btn btn-outline" onClick={downloadCsv} disabled={!examId}>Download CSV</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ textAlign: 'left', padding: '0.5rem' }}>Rank</th><th>Name</th><th>Email</th><th>Phone</th><th>Score</th></tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.rank} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>{r.rank}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!data.length && !loading && <p style={{ color: 'var(--text-muted)' }}>Select exam and click Load.</p>}
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) return null;
  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <h1>Admin / Reports</h1>
        <AdminNav />
        <Routes>
          <Route index element={<Navigate to="/admin/reports" replace />} />
          <Route path="reports" element={<Reports />} />
          {user.role === 'admin' && (
            <>
              <Route path="users" element={<UsersList />} />
              <Route path="questions" element={<UploadQuestion />} />
              <Route path="bulk" element={<BulkUpload />} />
            </>
          )}
        </Routes>
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
