/**
 * Transforms the teammate's /api/report response shape into the shape
 * expected by DoctorBrief and PatientPrepCard companion components.
 */
export default function normalizeReport(raw) {
  if (!raw) return null;

  const meds = raw.medications_and_allergies || {};

  return {
    chief_complaint: raw.chief_complaint || '',
    symptoms: (raw.symptoms || []).map(s => ({
      name: s.symptom,
      duration: s.duration || '',
      severity: parseSeverity(s.severity),
    })),
    medications: filterNoneReported(meds.current_medications),
    allergies: filterNoneReported(meds.allergies),
    red_flags: (raw.red_flags || []).map(f => ({
      symptom: f.flag,
      urgency: normalizeUrgency(f.urgency),
    })),
    questions_for_doctor: raw.questions_for_doctor || [],
    summary_plain_english: raw.patient_summary || '',
    visit_type_recommendation: deriveVisitType(raw.red_flags || []),
  };
}

function parseSeverity(sev) {
  if (typeof sev === 'number') return sev;
  if (!sev) return 3;
  const match = String(sev).match(/(\d+)\s*\/\s*10/);
  if (match) return parseInt(match[1], 10);
  const digits = String(sev).match(/\b(\d+)\b/);
  if (digits) return Math.min(parseInt(digits[1], 10), 10);
  const l = String(sev).toLowerCase();
  if (l.includes('severe')) return 8;
  if (l.includes('moderate')) return 5;
  if (l.includes('mild')) return 3;
  return 5;
}

function normalizeUrgency(u) {
  const l = (u || '').toLowerCase();
  if (l === 'emergency') return 'emergency';
  if (l === 'urgent' || l === 'soon') return 'urgent';
  return 'routine';
}

function deriveVisitType(redFlags) {
  const urgencies = redFlags.map(f => (f.urgency || '').toLowerCase());
  if (urgencies.includes('emergency')) return 'emergency';
  if (urgencies.includes('urgent') || urgencies.includes('soon')) return 'urgent';
  return 'routine';
}

function filterNoneReported(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(v => v && v.toLowerCase() !== 'none reported');
}
