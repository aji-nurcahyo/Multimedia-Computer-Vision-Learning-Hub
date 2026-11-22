import { useState } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import type { QuizQuestion } from '../lib/content';

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = questions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Kuis Evaluasi Pemahaman Bab</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Uji pemahaman Anda terhadap konsep matematis, properti kernel, dan implementasi yang telah dibahas.
          </p>
        </div>
        {submitted && (
          <button className="control-btn" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Ulangi Kuis</span>
          </button>
        )}
      </div>

      {submitted && (
        <div
          className="card"
          style={{
            background: percentage >= 80 ? 'var(--accent-glow)' : 'var(--primary-glow)',
            borderColor: percentage >= 80 ? 'var(--accent)' : 'var(--primary)',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <Award size={36} color={percentage >= 80 ? 'var(--accent)' : 'var(--primary)'} style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Skor Anda: {score} dari {questions.length} ({percentage}%)
          </h3>
          <p style={{ color: 'var(--text)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            {percentage === 100
              ? 'Luar biasa! Anda telah menguasai seluruh konsep matematis dan implementasi pada bab ini secara tuntas.'
              : percentage >= 70
              ? 'Bagus sekali! Pemahaman konsep Anda sudah solid. Tinjau pembahasan di bawah untuk menyempurnakan jawaban Anda.'
              : 'Perlu latihan lebih lanjut. Silakan tinjau kembali modul bacaan dan eksperimen di laboratorium interaktif.'}
          </p>
        </div>
      )}

      {questions.map((q, qIdx) => {
        const userChoice = selectedAnswers[q.id];

        return (
          <div key={q.id} className="quiz-card">
            <div className="quiz-question">
              <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Pertanyaan {qIdx + 1}:</span>
              {q.question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map((opt, optIdx) => {
                let optClass = 'quiz-option';
                let icon = null;

                if (submitted) {
                  if (optIdx === q.correctIndex) {
                    optClass += ' correct';
                    icon = <CheckCircle size={16} color="var(--accent)" />;
                  } else if (userChoice === optIdx) {
                    optClass += ' wrong';
                    icon = <XCircle size={16} color="var(--danger)" />;
                  }
                } else if (userChoice === optIdx) {
                  optClass += ' selected';
                }

                return (
                  <div
                    key={optIdx}
                    className={optClass}
                    onClick={() => handleSelect(q.id, optIdx)}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.95rem' }}>{opt}</span>
                    {icon}
                  </div>
                );
              })}
            </div>

            {submitted && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>
                  Pembahasan Akademik:
                </strong>
                <p style={{ color: 'var(--text-muted)' }}>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          className="control-btn"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(selectedAnswers).length < questions.length}
          style={{
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            padding: '0.8rem 1.75rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            display: 'block',
            margin: '2rem auto 0',
          }}
        >
          Kumpulkan Jawaban Kuis
        </button>
      )}
    </div>
  );
}
