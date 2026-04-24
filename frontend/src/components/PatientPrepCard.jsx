import React, { useState } from 'react';
import './PatientPrepCard.css';

/**
 * PatientPrepCard — Module 3
 *
 * Patient-facing prep card shown after the report is generated.
 * Three sections: "Say This", "Ask This", "Don't Forget".
 *
 * Props:
 *   report       {object}  — full report JSON from /report endpoint (required)
 *   analysisFlags {array}  — flags array from /analyze response (optional)
 *
 * Integration (teammate's App.js):
 *   import PatientPrepCard from './components/PatientPrepCard';
 *   // In "For You" tab, after summary:
 *   <PatientPrepCard report={report} analysisFlags={analysisFlags} />
 */

function getTopSeveritySymptom(symptoms) {
  if (!symptoms || symptoms.length === 0) return null;
  return symptoms.reduce((a, b) => (b.severity > a.severity ? b : a));
}

function buildDontForget(medications, allergies) {
  const hasMeds = medications && medications.length > 0;
  const hasAllergies = allergies && allergies.length > 0;

  if (hasMeds && hasAllergies) {
    // Combine — lead with the first allergy (safety-critical), mention meds
    return `Tell them about your ${allergies[0]} allergy and that you're taking ${medications[0]}`;
  }
  if (hasMeds) {
    return `Mention you're taking ${medications.join(', ')}`;
  }
  if (hasAllergies) {
    return `Tell them about your ${allergies.join(', ')} allergy`;
  }
  return null;
}

function buildAskThis(questionsForDoctor, analysisFlags) {
  // Prioritize high-priority analysis flags when available
  if (analysisFlags && analysisFlags.length > 0) {
    const highFlags = analysisFlags
      .filter(f => f.priority === 'high')
      .map(f => f.question_to_ask);
    if (highFlags.length >= 2) return highFlags.slice(0, 2);
    // Fill remaining slots from questions_for_doctor
    const rest = (questionsForDoctor || []).slice(0, 2 - highFlags.length);
    return [...highFlags, ...rest].slice(0, 2);
  }
  return (questionsForDoctor || []).slice(0, 2);
}

function buildPlainText(sayItems, askItems, dontForget) {
  const lines = [
    '--- RxReady Prep Card ---',
    '',
    'SAY THIS:',
    ...sayItems.map(i => `  - ${i}`),
    '',
    'ASK THIS:',
    ...askItems.map(i => `  - ${i}`),
  ];
  if (dontForget) {
    lines.push('', "DON'T FORGET:", `  - ${dontForget}`);
  }
  return lines.join('\n');
}

export default function PatientPrepCard({ report, analysisFlags }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const {
    chief_complaint = '',
    symptoms = [],
    medications = [],
    allergies = [],
    questions_for_doctor = [],
    visit_type_recommendation = 'routine',
  } = report;

  // -- Build sections --
  const topSymptom = getTopSeveritySymptom(symptoms);

  const sayItems = [
    chief_complaint,
    topSymptom
      ? `My worst symptom is ${topSymptom.name} — I'd rate it ${topSymptom.severity}/10`
      : null,
    topSymptom
      ? `It's been going on for ${topSymptom.duration}`
      : (symptoms[0] ? `It started ${symptoms[0].duration} ago` : null),
  ].filter(Boolean);

  const askItems = buildAskThis(questions_for_doctor, analysisFlags);
  const dontForget = buildDontForget(medications, allergies);

  const urgencyLevel = (visit_type_recommendation || 'routine').toLowerCase();
  const urgencyLabel =
    urgencyLevel === 'emergency'
      ? 'Emergency'
      : urgencyLevel === 'urgent'
      ? 'Urgent Visit'
      : 'Routine Visit';

  const handleCopy = () => {
    const text = buildPlainText(sayItems, askItems, dontForget);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="prep-card">
      {/* Header */}
      <div className="prep-card__header">
        <span className="prep-card__title">Your Appointment Prep</span>
        <span className={`prep-card__urgency-badge prep-card__urgency-badge--${urgencyLevel}`}>
          {urgencyLabel}
        </span>
      </div>

      <div className="prep-card__sections">
        {/* Section 1: Say This */}
        <div className="prep-card__section">
          <div className="prep-card__section-label">Say This</div>
          <ul className="prep-card__items">
            {sayItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 2: Ask This */}
        {askItems.length > 0 && (
          <div className="prep-card__section">
            <div className="prep-card__section-label">Ask This</div>
            <ul className="prep-card__items">
              {askItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 3: Don't Forget */}
        {dontForget && (
          <div className="prep-card__section">
            <div className="prep-card__section-label">Don't Forget</div>
            <ul className="prep-card__items">
              <li>{dontForget}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Copy button */}
      <button
        className={`prep-card__copy-btn${copied ? ' prep-card__copy-btn--copied' : ''}`}
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </>
        )}
      </button>
    </div>
  );
}
