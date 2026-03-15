import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Leaderboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [examId, setExamId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [tab, setTab] = useState('chapter'); // 'chapter' | 'overall'
  const [chapterRanks, setChapterRanks] = useState([]);
  const [overallRanks, setOverallRanks] = useState([]);
  const [myChapterRank, setMyChapterRank] = useState(null);
  const [myOverallRank, setMyOverallRank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/api/exams').then(({ exams: e }) => setExams(e)).catch(() => setExams([]));
  }, []);

  useEffect(() => {
    setChapterId('');
    if (!examId) { setChapters([]); return; }
    api(`/api/exams/${examId}/chapters`).then(({ chapters: c }) => setChapters(c)).catch(() => setChapters([]));
  }, [examId]);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    if (tab === 'chapter' && chapterId) {
      api(`/api/ranks/chapter?examId=${examId}&chapterId=${chapterId}`)
        .then(({ ranks, myRank }) => { setChapterRanks(ranks); setMyChapterRank(myRank); })
        .catch(() => { setChapterRanks([]); setMyChapterRank(null); })
        .finally(() => setLoading(false));
    } else {
      api(`/api/ranks/overall?examId=${examId}`)
        .then(({ ranks, myRank }) => { setOverallRanks(ranks); setMyOverallRank(myRank); })
        .catch(() => { setOverallRanks([]); setMyOverallRank(null); })
        .finally(() => setLoading(false));
    }
  }, [examId, chapterId, tab]);

  const ranks = tab === 'chapter' ? chapterRanks : overallRanks;
  const myRank = tab === 'chapter' ? myChapterRank : myOverallRank;

  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>Leaderboard</h1>
        <div className="form-group">
          <label>Exam</label>
          <select value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">Select exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button type="button" className={`btn ${tab === 'chapter' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('chapter')}>Chapter wise</button>
          <button type="button" className={`btn ${tab === 'overall' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('overall')}>Overall</button>
        </div>
        {tab === 'chapter' && (
          <div className="form-group">
            <label>Chapter</label>
            <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              <option value="">Select chapter</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        {myRank && (
          <div className="card" style={{ background: 'var(--primary)', color: 'white', marginBottom: '1rem' }}>
            <strong>Your rank: #{myRank.rank}</strong> {tab === 'overall' ? `Total score: ${myRank.totalScore}` : `Score: ${myRank.score}`}
          </div>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="rank-list">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Rank</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>{tab === 'overall' ? 'Total score' : 'Score'}</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((r) => (
                  <tr key={r.userId} style={{ borderBottom: '1px solid var(--border)', background: (r.userId && user?._id && String(r.userId) === String(user._id)) ? 'rgba(26,54,93,0.06)' : undefined }}>
                    <td style={{ padding: '0.5rem' }}>#{r.rank}</td>
                    <td style={{ padding: '0.5rem' }}>{r.name}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{tab === 'overall' ? r.totalScore : r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!ranks.length && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No ranks yet. Take a test to appear here.</p>}
          </div>
        )}
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
