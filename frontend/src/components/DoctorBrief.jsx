import React from 'react';
import './DoctorBrief.css';

/**
 * DoctorBrief — Module 1
 *
 * Renders a scannable clinical brief for the "For Your Doctor" tab.
 *
 * Props:
 *   report {object} — full report JSON from /report endpoint
 *
 * Integration (teammate's App.js):
 *   import DoctorBrief from './components/DoctorBrief';
 *   // In "For Your Doctor" tab:
 *   <DoctorBrief report={report} />
 */

function severityClass(score) {
  if (score >= 8) return 'doctor-brief__severity--high';
  if (score >= 5) return 'doctor-brief__severity--medium';
  return 'doctor-brief__severity--low';
}

function UrgencyBadge({ urgency }) {
  const level = (urgency || '').toLowerCase();
  return (
    <span className={`doctor-brief__badge doctor-brief__badge--${level}`}>
      {level}
    </span>
  );
}

export default function DoctorBrief({ report }) {
  if (!report) return null;

  const {
    chief_complaint = '',
    symptoms = [],
    medications = [],
    allergies = [],
    red_flags = [],
    questions_for_doctor = [],
  } = report;

  const handlePrint = () => window.print();

  return (
    <div className="doctor-brief">
      {/* 1. Chief Complaint */}
      <div className="doctor-brief__chief">
        <div className="doctor-brief__chief-label">Chief Complaint</div>
        <div className="doctor-brief__chief-text">{chief_complaint}</div>
      </div>

      {/* 2. Symptom Table */}
      <div className="doctor-brief__section">
        <div className="doctor-brief__section-title">Symptoms</div>
        {symptoms.length === 0 ? (
          <span className="doctor-brief__empty">No symptoms recorded</span>
        ) : (
          <table className="doctor-brief__table">
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Duration</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {symptoms.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.duration}</td>
                  <td>
                    <span className={`doctor-brief__severity ${severityClass(s.severity)}`}>
                      {s.severity}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Medications & Allergies */}
      <div className="doctor-brief__section">
        <div className="doctor-brief__med-allergy-grid">
          <div>
            <div className="doctor-brief__section-title">Medications</div>
            {medications.length === 0 ? (
              <span className="doctor-brief__empty">None reported</span>
            ) : (
              <div className="doctor-brief__pill-list">
                {medications.map((m, i) => (
                  <span key={i} className="doctor-brief__pill">{m}</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="doctor-brief__section-title">Allergies</div>
            {allergies.length === 0 ? (
              <span className="doctor-brief__empty">None reported</span>
            ) : (
              <div className="doctor-brief__pill-list">
                {allergies.map((a, i) => (
                  <span key={i} className="doctor-brief__pill doctor-brief__pill--allergy">{a}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Red Flags */}
      {red_flags.length > 0 && (
        <div className="doctor-brief__section">
          <div className="doctor-brief__section-title">Red Flags</div>
          <div className="doctor-brief__flag-list">
            {red_flags.map((f, i) => (
              <div key={i} className="doctor-brief__flag">
                <span className="doctor-brief__flag-symptom">{f.symptom}</span>
                <UrgencyBadge urgency={f.urgency} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Questions to Address */}
      {questions_for_doctor.length > 0 && (
        <div className="doctor-brief__section">
          <div className="doctor-brief__section-title">Questions to Address</div>
          <ul className="doctor-brief__questions">
            {questions_for_doctor.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Print Button */}
      <button className="doctor-brief__print-btn" onClick={handlePrint}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print / Save as PDF
      </button>
    </div>
  );
}
