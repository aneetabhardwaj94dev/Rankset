import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Dashboard() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lang, setLang] = useState(user?.preferredLanguage || 'en');
  const [examId, setExamId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { languages: l } = await api('/api/exams/languages');
        setLanguages(l);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setExamId('');
    setChapterId('');
    if (!lang) return;
    api(`/api/exams?language=${lang}`).then(({ exams: e }) => setExams(e)).catch(() => setExams([]));
  }, [lang]);

  useEffect(() => {
    setChapterId('');
    if (!examId) { setChapters([]); return; }
    api(`/api/exams/${examId}/chapters`).then(({ chapters: c }) => setChapters(c)).catch(() => setChapters([]));
  }, [examId]);

  const canStart = examId && chapterId;
  const startUrl = canStart ? `/test?examId=${examId}&chapterId=${chapterId}` : '#';

  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>Choose your test</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Select language, exam, and chapter to start.</p>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="form-group">
              <label>Language</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Competitive exam</label>
              <select value={examId} onChange={(e) => setExamId(e.target.value)}>
                <option value="">Select exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Chapter / Topic</label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                <option value="">Select chapter</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Link to={startUrl} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Start test
            </Link>
          </>
        )}
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
