import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AdPlaceholder from '../components/AdPlaceholder';

export default function Test() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get('examId');
  const chapterId = searchParams.get('chapterId');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!examId || !chapterId) { navigate('/'); return; }
    api(`/api/tests/questions?examId=${examId}&chapterId=${chapterId}`)
      .then(({ questions: q }) => { setQuestions(q); setAnswers({}); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [examId, chapterId, navigate]);

  const setAnswer = (qId, index) => setAnswers((a) => ({ ...a, [qId]: index }));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    try {
      const payload = {
        examId,
        chapterId,
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
        timeSpentSeconds,
      };
      const result = await api('/api/tests/submit', { method: 'POST', body: JSON.stringify(payload) });
      sessionStorage.setItem('rankset_last_result', JSON.stringify({ ...result, examId, chapterId }));
      navigate('/result');
    } catch (e) {
      alert(e.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading questions...</div>;
  if (!questions.length) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>No questions in this chapter. <a href="/">Go back</a>.</div>;

  const q = questions[current];
  const total = questions.length;
  const answered = Object.keys(answers).length;

  return (
    <>
      <AdPlaceholder position="top" />
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <strong>Question {current + 1} of {total}</strong>
          <span style={{ color: 'var(--text-muted)' }}>Answered: {answered}/{total}</span>
        </div>
        <div className="progress-bar" style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${(answered / total) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
        </div>
        <div className="question-block" style={{ marginBottom: '1.5rem' }}>
          <p className="question-text" style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{q.questionText}</p>
          {q.questionImage && <img src={q.questionImage.startsWith('http') ? q.questionImage : import.meta.env.VITE_API_URL + q.questionImage} alt="Question" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: '1rem' }} />}
          <div className="options">
            {q.options.map((opt, i) => (
              <label key={i} className="option-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', border: `2px solid ${answers[q._id] === i ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name={q._id} checked={answers[q._id] === i} onChange={() => setAnswer(q._id, i)} />
                <span>{opt.text}</span>
                {opt.image && <img src={opt.image.startsWith('http') ? opt.image : import.meta.env.VITE_API_URL + opt.image} alt="" style={{ maxWidth: 120, borderRadius: 4 }} />}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>
          {current < total - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next</button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>{submitting ? 'Submitting...' : 'Submit test'}</button>
          )}
        </div>
      </div>
      <AdPlaceholder position="bottom" />
    </>
  );
}
