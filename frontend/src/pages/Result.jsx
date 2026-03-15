import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';

function ShareButtons({ score, totalQuestions, correctCount }) {
  const text = `I scored ${score}% on Rankset (${correctCount}/${totalQuestions} correct). Try your rank!`;
  const url = typeof window !== 'undefined' ? window.location.origin : '';

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rankset - My Test Result',
          text,
          url,
        });
      } catch (e) {}
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      <button type="button" className="btn btn-primary" onClick={share}>Share (native)</button>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">WhatsApp</a>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Twitter / X</a>
      <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Instagram</a>
    </div>
  );
}

export default function Result() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showMistakes, setShowMistakes] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('rankset_last_result');
    if (!raw) { navigate('/'); return; }
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const { score, totalQuestions, correctCount, results = [] } = data;

  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>Test result</h1>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{score}%</p>
        <p style={{ color: 'var(--text-muted)' }}>{correctCount} correct out of {totalQuestions} questions.</p>
        <ShareButtons score={score} totalQuestions={totalQuestions} correctCount={correctCount} />
        <div style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setShowMistakes((s) => !s)}>
            {showMistakes ? 'Hide' : 'Show'} mistakes &amp; explanations
          </button>
        </div>
        {showMistakes && results.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Review</h2>
            {results.map((r, i) => (
              <div key={i} className="card" style={{ padding: '0.75rem', marginBottom: '0.5rem', background: r.correct ? 'rgba(56,161,105,0.08)' : 'rgba(229,62,62,0.08)' }}>
                <p><strong>Q{i + 1}:</strong> {r.correct ? 'Correct' : 'Incorrect'} (selected option {r.selectedIndex + 1}, correct was {r.correctOptionIndex + 1})</p>
                {r.explanation && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{r.explanation}</p>}
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/leaderboard" className="btn btn-primary">See leaderboard</Link>
          <Link to="/" className="btn btn-outline" style={{ marginLeft: '0.5rem' }}>Dashboard</Link>
        </p>
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
