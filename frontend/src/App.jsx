import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './img.png';
import DoctorBrief from './components/DoctorBrief';
import PatientPrepCard from './components/PatientPrepCard';
import normalizeReport from './normalizeReport';

const API = '';
const MIN_EXCHANGES = 6;

const URGENCY_CONFIG = {
  emergency: { color: '#dc2626', bg: '#fff1f1', border: '#fca5a5', label: 'EMERGENCY', dot: '#dc2626' },
  urgent:    { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'URGENT',    dot: '#ea580c' },
  soon:      { color: '#ca8a04', bg: '#fefce8', border: '#fde68a', label: 'SOON',      dot: '#ca8a04' },
  routine:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'ROUTINE',   dot: '#16a34a' },
};

function BrandMark({ className = '' }) {
  return <img src={logo} alt="MedBrief" className={`brand-mark ${className}`.trim()} />;
}

function TypingDots() {
  return (
    <div className="typing">
      <span/><span/><span/>
    </div>
  );
}

function Message({ msg, isNew }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg ${isUser ? 'msg--user' : 'msg--ai'} ${isNew ? 'msg--new' : ''}`}>
      {!isUser && <div className="msg__avatar"><BrandMark className="brand-mark--avatar" /></div>}
      <div className="msg__bubble">{msg.content}</div>
    </div>
  );
}

function ReportView({ data, normalizedReport, analysisFlags, onBack }) {
  const [tab, setTab] = useState('you');

  const normalize = (val) => Array.isArray(val) ? val : (val ? [val] : []);

  const meds  = data.medications_and_allergies || {};
  const flags = data.red_flags || [];

  const sevColor = (s) => {
    if (!s) return '#16a34a';
    const l = s.toLowerCase();
    return l.includes('severe') ? '#dc2626' : l.includes('moderate') ? '#ea580c' : '#16a34a';
  };

  return (
    <div className="report">
      {/* TOP BAR */}
      <div className="report__bar">
        <button className="report__back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="report__brand">
          <span className="report__logo"><BrandMark className="brand-mark--report" /></span>
          <span className="report__title">Pre-Appointment Report</span>
        </div>
        <button className="report__print" onClick={() => window.print()}>
          Print PDF
        </button>
      </div>

      {/* HERO */}
      <div className="report__hero">
        <div className="report__hero-left">
          <p className="report__label">CHIEF COMPLAINT</p>
          <h1 className="report__complaint">{data.chief_complaint}</h1>
          <p className="report__summary">{data.patient_summary}</p>
        </div>
        <div className="report__hero-right">
          <div className="report__date-block">
            <p className="report__label">DATE</p>
            <p className="report__date-val">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="report__stats">
            <div className="report__stat">
              <span className="report__stat-num">{(data.symptoms || []).length}</span>
              <span className="report__stat-label">Symptoms</span>
            </div>
            <div className="report__stat">
              <span className="report__stat-num" style={{ color: flags.length > 0 ? '#dc2626' : '#16a34a' }}>{flags.length}</span>
              <span className="report__stat-label">Flags</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLAGS */}
      {flags.length > 0 && (
        <div className="report__flags">
          <p className="report__label">ATTENTION REQUIRED</p>
          <div className="report__flags-grid">
            {flags.map((f, i) => {
              const cfg = URGENCY_CONFIG[f.urgency] || URGENCY_CONFIG.routine;
              return (
                <div key={i} className="flag" style={{ background: cfg.bg, borderColor: cfg.border }}>
                  <div className="flag__top">
                    <span className="flag__dot" style={{ background: cfg.dot }} />
                    <span className="flag__urgency" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <p className="flag__name">{f.flag}</p>
                  <p className="flag__reason">{f.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="report__tabs">
        <button className={`report__tab ${tab === 'you' ? 'report__tab--active' : ''}`} onClick={() => setTab('you')}>For You</button>
        <button className={`report__tab ${tab === 'doc' ? 'report__tab--active' : ''}`} onClick={() => setTab('doc')}>For Your Doctor</button>
      </div>

      {/* CONTENT */}
      <div className="report__body">

        {tab === 'you' && (
          <>
            {/* Symptoms */}
            {(data.symptoms || []).length > 0 && (
              <section className="section">
                <p className="section__label">YOUR SYMPTOMS</p>
                <div className="symptom-cards">
                  {data.symptoms.map((s, i) => (
                    <div key={i} className="symp">
                      <div className="symp__header">
                        <span className="symp__dot" style={{ background: sevColor(s.severity) }} />
                        <span className="symp__name">{s.symptom}</span>
                        <span className="symp__sev">{s.severity}</span>
                      </div>
                      <div className="symp__meta">
                        {s.duration && <span>⏱ {s.duration}</span>}
                        {s.pattern  && <span>↺ {s.pattern}</span>}
                      </div>
                      {s.details && <p className="symp__detail">{s.details}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Questions */}
            {(data.questions_for_doctor || []).length > 0 && (
              <section className="section">
                <p className="section__label">ASK YOUR DOCTOR</p>
                <div className="questions">
                  {data.questions_for_doctor.map((q, i) => (
                    <div key={i} className="question">
                      <span className="question__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="question__text">{q}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Meds */}
            <section className="section">
              <p className="section__label">MEDICATIONS & ALLERGIES</p>
              <div className="meds-grid">
                <div className="meds-col">
                  <p className="meds-col__label">Current Medications</p>
                  {normalize(meds.current_medications).map((m, i) => <p key={i} className="meds-item">💊 {m}</p>)}
                </div>
                <div className="meds-col">
                  <p className="meds-col__label">Allergies</p>
                  {normalize(meds.allergies).map((a, i) => <p key={i} className="meds-item meds-item--allergy">⚠ {a}</p>)}
                </div>
              </div>
              {normalize(meds.tried_for_this).length > 0 && (
                <div className="meds-tried">
                  <p className="meds-col__label">Already Tried</p>
                  {normalize(meds.tried_for_this).map((t, i) => <p key={i} className="meds-item">→ {t}</p>)}
                </div>
              )}
            </section>

            {normalizedReport && (
              <PatientPrepCard report={normalizedReport} analysisFlags={analysisFlags} />
            )}
          </>
        )}

        {tab === 'doc' && (
          <>
            <section className="section">
              <p className="section__label">CLINICAL SUMMARY</p>
              <div className="clinical-note">{data.doctor_note}</div>
            </section>

            {data.relevant_history && data.relevant_history !== 'Not reported' && (
              <section className="section">
                <p className="section__label">RELEVANT HISTORY</p>
                <div className="clinical-note">{data.relevant_history}</div>
              </section>
            )}

            {(data.symptoms || []).length > 0 && (
              <section className="section">
                <p className="section__label">SYMPTOM TABLE</p>
                <table className="sym-table">
                  <thead>
                    <tr>
                      <th>Symptom</th><th>Duration</th><th>Severity</th><th>Pattern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.symptoms.map((s, i) => (
                      <tr key={i}>
                        <td>{s.symptom}</td>
                        <td>{s.duration || '—'}</td>
                        <td>{s.severity || '—'}</td>
                        <td>{s.pattern  || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="section">
              <p className="section__label">MEDICATIONS & ALLERGIES</p>
              <div className="meds-grid">
                <div className="meds-col">
                  <p className="meds-col__label">Current Medications</p>
                  {normalize(meds.current_medications).map((m, i) => <p key={i} className="meds-item">• {m}</p>)}
                </div>
                <div className="meds-col">
                  <p className="meds-col__label">Allergies</p>
                  {normalize(meds.allergies).map((a, i) => <p key={i} className="meds-item meds-item--allergy">• {a}</p>)}
                </div>
              </div>
            </section>

            {normalizedReport && (
              <DoctorBrief report={normalizedReport} />
            )}
          </>
        )}

        <p className="report__disclaimer">
          ⓘ Generated by MedBrief to help you communicate with your doctor. Not a diagnosis or medical advice.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase]         = useState('chat');
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [reportData, setReportData] = useState(null);
  const [analysisFlags, setAnalysisFlags] = useState([]);
  const [exchanges, setExchanges] = useState(0);
  const [newMsgIdx, setNewMsgIdx] = useState(-1);
  const bottomRef = useRef();
  const inputRef  = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [input]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        setMessages([{ role: 'assistant', content: data.reply }]);
        setNewMsgIdx(0);
      } catch {
        setMessages([{ role: 'assistant', content: "Hi, I'm MedBrief. I'll help you prepare for your doctor's appointment. What's brought you in today?" }]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setNewMsgIdx(next.length - 1);
    setInput('');
    setLoading(true);

    try {
      const history = next.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: history.slice(0, -1) })
      });
      const data = await res.json();
      const withReply = [...next, { role: 'assistant', content: data.reply }];
      setMessages(withReply);
      setNewMsgIdx(withReply.length - 1);
      setExchanges(e => e + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const generateReport = async () => {
    setPhase('generating');
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history })
      });
      const data = await res.json();
      // normalize medication arrays
      if (data.medications_and_allergies) {
        ['current_medications', 'allergies', 'tried_for_this'].forEach(k => {
          const v = data.medications_and_allergies[k];
          if (!Array.isArray(v)) data.medications_and_allergies[k] = v ? [v] : [];
        });
      }
      setReportData(data);
      setPhase('report');

      // Call companion /analyze endpoint (non-fatal)
      try {
        const analyzeRes = await fetch(`${API}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report: data }),
        });
        if (analyzeRes.ok) {
          const { flags } = await analyzeRes.json();
          setAnalysisFlags(flags);
        }
      } catch (e) {
        console.warn('Analyze endpoint unavailable:', e);
      }
    } catch {
      alert('Failed to generate report.');
      setPhase('chat');
    }
  };

  if (phase === 'report' && reportData) {
    const normalized = normalizeReport(reportData);
    return (
      <ReportView
        data={reportData}
        normalizedReport={normalized}
        analysisFlags={analysisFlags}
        onBack={() => setPhase('chat')}
      />
    );
  }

  if (phase === 'generating') {
    return (
      <div className="generating">
        <div className="generating__logo"><BrandMark className="brand-mark--generating" /></div>
        <p className="generating__title">Building your report</p>
        <p className="generating__sub">Organizing symptoms and preparing notes for your doctor.</p>
        <div className="generating__bar"><div className="generating__fill" /></div>
      </div>
    );
  }

  const readyForReport = exchanges >= MIN_EXCHANGES;

  return (
    <div className="shell">
      {/* HEADER */}
      <header className="header">
        <div className="header__brand">
          <div className="header__logo"><BrandMark className="brand-mark--header" /></div>
          <div className="header__text">
            <span className="header__name">MedBrief</span>
            <span className="header__sub">Pre-appointment assistant</span>
          </div>
        </div>
        {readyForReport && (
          <button className="header__cta" onClick={generateReport}>
            Generate Report
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </header>

      {/* PROGRESS */}
      {exchanges > 0 && !readyForReport && (
        <div className="progress">
          <div className="progress__track">
            <div className="progress__fill" style={{ width: `${(exchanges / MIN_EXCHANGES) * 100}%` }} />
          </div>
          <span className="progress__label">{MIN_EXCHANGES - exchanges} more to unlock report</span>
        </div>
      )}

      {/* MESSAGES */}
      <div className="chat">
        {messages.map((m, i) => (
          <Message key={i} msg={m} isNew={i === newMsgIdx} />
        ))}
        {loading && (
          <div className="msg msg--ai">
            <div className="msg__avatar"><BrandMark className="brand-mark--avatar" /></div>
            <div className="msg__bubble"><TypingDots /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="composer">
        <div className="composer__box">
          <textarea
            ref={textareaRef}
            className="composer__input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe your symptoms…"
            rows={1}
          />
          <button className="composer__send" onClick={send} disabled={!input.trim() || loading}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="composer__disclaimer">Not a diagnostic tool · Always consult a qualified physician</p>
      </div>
    </div>
  );
}