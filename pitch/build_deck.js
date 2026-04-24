/**
 * build_deck.js — RxReady Hackathon Pitch Deck
 * Generates RxReady_Pitch.pptx using pptxgenjs
 *
 * Run: node build_deck.js
 * Requires: npm install pptxgenjs
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bgDark:   '0d1f2d',
  bgLight:  'f0f8ff',
  accent:   '00b4a6',
  accentB:  '0891b2',
  white:    'e8f4f8',
  muted:    '7a9bb5',
  surface:  '112233',
  red:      'ef4444',
  amber:    'f59e0b',
  green:    '10b981',
  black:    '111111',
  darkText: '1a2e42',
};

// ─── Typography helpers ───────────────────────────────────────────────────────
const H  = { fontFace: 'Cambria', bold: true };
const B  = { fontFace: 'Calibri' };

// ─── Slide helpers ────────────────────────────────────────────────────────────
function darkSlide(slide) {
  slide.background = { color: C.bgDark };
}
function lightSlide(slide) {
  slide.background = { color: C.bgLight };
}

/**
 * Add a section label chip above a content block.
 */
function addChip(slide, text, x, y, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: opts.w || 1.6, h: 0.26,
    fill: { color: C.accent },
    line: { color: C.accent },
    rectRadius: 0.05,
  });
  slide.addText(text, {
    x, y, w: opts.w || 1.6, h: 0.26,
    fontSize: 9, bold: true, color: 'FFFFFF',
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
}

/**
 * Add a stat callout box (used on slide 2).
 */
function addStatBox(slide, stat, label, x, y) {
  // Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 2.7, h: 1.6,
    fill: { color: C.surface },
    line: { color: C.accent, pt: 1.5 },
    rectRadius: 0.1,
  });
  // Stat
  slide.addText(stat, {
    x, y: y + 0.22, w: 2.7, h: 0.7,
    fontSize: 28, bold: true, color: C.accent,
    fontFace: 'Cambria', align: 'center',
  });
  // Label
  slide.addText(label, {
    x, y: y + 0.92, w: 2.7, h: 0.5,
    fontSize: 12, color: C.white,
    fontFace: 'Calibri', align: 'center',
    wrap: true,
  });
}

/**
 * Add a feature row with a teal bullet and text.
 */
function addBulletRow(slide, text, x, y, color) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x, y: y + 0.06, w: 0.10, h: 0.10,
    fill: { color: color || C.accent },
    line: { color: color || C.accent },
  });
  slide.addText(text, {
    x: x + 0.18, y, w: 8.5 - x, h: 0.30,
    fontSize: 14, color: C.darkText,
    fontFace: 'Calibri',
  });
}

// ─── SLIDE 1 — Title ──────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  darkSlide(slide);

  // Accent strip on left
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.22, h: 5.63,
    fill: { color: C.accent },
    line: { color: C.accent },
  });

  // "RxReady" wordmark
  slide.addText('RxReady', {
    x: 0.55, y: 1.6, w: 9, h: 1.5,
    fontSize: 72, bold: true,
    color: C.white, fontFace: 'Cambria',
  });

  // Tagline
  slide.addText('Know before you go.', {
    x: 0.55, y: 3.1, w: 9, h: 0.6,
    fontSize: 24, color: C.accent,
    fontFace: 'Calibri', italic: true,
  });

  // Track tag
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55, y: 4.2, w: 2.8, h: 0.38,
    fill: { color: C.accent },
    line: { color: C.accent },
    rectRadius: 0.08,
  });
  slide.addText('Health & Wellbeing Track', {
    x: 0.55, y: 4.2, w: 2.8, h: 0.38,
    fontSize: 13, bold: true, color: '0d1f2d',
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
}

// ─── SLIDE 2 — The Problem ────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('The Problem', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  slide.addText(
    'Patients arrive unprepared, overwhelmed, and unheard.',
    {
      x: 0.6, y: 1.0, w: 9, h: 0.4,
      fontSize: 16, color: C.muted,
      fontFace: 'Calibri', italic: true,
    }
  );

  // Three stat callout boxes
  addStatBox(slide, '1 in 3', 'patients forget key symptoms\nbefore their appointment', 0.55, 1.7);
  addStatBox(slide, '18 min', 'average time with a doctor\n— every word counts',        3.65, 1.7);
  addStatBox(slide, 'Billions', 'navigate healthcare alone,\nwithout guidance or tools', 6.75, 1.7);

  // Supporting line
  slide.addText(
    'Healthcare is the one moment where being unprepared has real consequences.',
    {
      x: 0.6, y: 4.6, w: 8.8, h: 0.5,
      fontSize: 14, color: C.darkText,
      fontFace: 'Calibri', align: 'center',
    }
  );
}

// ─── SLIDE 3 — The Solution ───────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('The Solution', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  // Left column: 4-step flow
  const steps = [
    ['1', 'Describe', 'Tell RxReady your symptoms\nin plain language'],
    ['2', 'Claude Asks', 'Smart follow-up questions\nfill in the clinical picture'],
    ['3', 'Report Generated', 'Structured brief ready for\nboth patient and doctor'],
    ['4', 'Walk In Prepared', 'Prep card in hand, questions\nlined up, confidence high'],
  ];

  steps.forEach(([num, title, desc], i) => {
    const y = 1.2 + i * 0.95;
    // Step circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.5, y: y, w: 0.42, h: 0.42,
      fill: { color: C.accent },
      line: { color: C.accent },
    });
    slide.addText(num, {
      x: 0.5, y: y, w: 0.42, h: 0.42,
      fontSize: 14, bold: true, color: 'FFFFFF',
      fontFace: 'Cambria', align: 'center', valign: 'middle',
    });
    // Connector line (except last)
    if (i < 3) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.69, y: y + 0.44, w: 0.05, h: 0.49,
        fill: { color: C.muted },
        line: { color: C.muted },
      });
    }
    // Title
    slide.addText(title, {
      x: 1.1, y: y - 0.01, w: 3.5, h: 0.3,
      fontSize: 14, bold: true, color: C.darkText,
      fontFace: 'Calibri',
    });
    slide.addText(desc, {
      x: 1.1, y: y + 0.26, w: 3.5, h: 0.4,
      fontSize: 11, color: C.muted,
      fontFace: 'Calibri',
    });
  });

  // Right column: schematic chat-UI representation
  const chatX = 5.3;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: chatX, y: 1.1, w: 4.1, h: 3.8,
    fill: { color: C.surface },
    line: { color: C.accent, pt: 1.5 },
    rectRadius: 0.15,
  });
  // Header bar
  slide.addShape(pptx.ShapeType.rect, {
    x: chatX, y: 1.1, w: 4.1, h: 0.45,
    fill: { color: C.accent },
    line: { color: C.accent },
  });
  slide.addText('RxReady Chat', {
    x: chatX, y: 1.1, w: 4.1, h: 0.45,
    fontSize: 13, bold: true, color: '0d1f2d',
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
  // Chat bubbles
  const bubbles = [
    { text: "I've had a headache for 3 days", right: true },
    { text: "Is the pain constant or does it come and go?", right: false },
    { text: "It gets worse in the evening", right: true },
    { text: "Report ready — tap to view", right: false, accent: true },
  ];
  bubbles.forEach((b, i) => {
    const by = 1.75 + i * 0.68;
    const bx = b.right ? chatX + 1.5 : chatX + 0.15;
    const bw = 2.35;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: by, w: bw, h: 0.44,
      fill: { color: b.accent ? C.accent : (b.right ? C.accentB : '1a3a52') },
      line: { color: b.accent ? C.accent : (b.right ? C.accentB : '1a3a52') },
      rectRadius: 0.1,
    });
    slide.addText(b.text, {
      x: bx, y: by, w: bw, h: 0.44,
      fontSize: 10,
      color: b.accent ? '0d1f2d' : C.white,
      fontFace: 'Calibri', align: b.right ? 'right' : 'left',
      valign: 'middle', margin: 6,
    });
  });
}

// ─── SLIDE 4 — For the Patient ────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('For the Patient', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  slide.addText(
    '"For You" tab — understand your health in plain English',
    {
      x: 0.6, y: 1.0, w: 9, h: 0.4,
      fontSize: 16, color: C.muted,
      fontFace: 'Calibri', italic: true,
    }
  );

  // Feature card
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55, y: 1.6, w: 8.9, h: 3.4,
    fill: { color: C.surface },
    line: { color: C.accent, pt: 1 },
    rectRadius: 0.12,
  });

  const features = [
    ['Plain-English Summary', 'No jargon. Describes what\'s happening in language you actually understand.'],
    ['Say This (3 items)', 'Chief complaint, top severity symptom, and how long it\'s been going on.'],
    ['Ask This (2 items)', 'The most important questions to raise — prioritized by Claude analysis.'],
    ["Don't Forget (1 item)", 'Critical reminder: medications or allergies the doctor must know.'],
    ['Urgency Badge', 'Routine / Urgent / Emergency — pulses red when action is needed now.'],
  ];

  features.forEach(([title, desc], i) => {
    const fy = 1.8 + i * 0.6;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.8, y: fy + 0.08, w: 0.10, h: 0.10,
      fill: { color: C.accent }, line: { color: C.accent },
    });
    slide.addText(title, {
      x: 1.05, y: fy, w: 2.4, h: 0.3,
      fontSize: 13, bold: true, color: C.white,
      fontFace: 'Calibri',
    });
    slide.addText(desc, {
      x: 3.5, y: fy, w: 5.7, h: 0.3,
      fontSize: 13, color: C.white,
      fontFace: 'Calibri',
    });
  });
}

// ─── SLIDE 5 — For the Doctor ─────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('For the Doctor', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  slide.addText(
    '"For Your Doctor" tab — a clinical brief readable in 30 seconds',
    {
      x: 0.6, y: 1.0, w: 9, h: 0.4,
      fontSize: 16, color: C.muted,
      fontFace: 'Calibri', italic: true,
    }
  );

  // Schematic doctor brief card
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55, y: 1.55, w: 8.9, h: 3.6,
    fill: { color: C.surface },
    line: { color: C.accent, pt: 1 },
    rectRadius: 0.12,
  });

  // Chief complaint mock
  slide.addText('CHIEF COMPLAINT', {
    x: 0.9, y: 1.75, w: 4, h: 0.22,
    fontSize: 9, bold: true, color: C.muted,
    fontFace: 'Calibri', charSpacing: 2,
  });
  slide.addText('Persistent headache with light sensitivity', {
    x: 0.9, y: 1.95, w: 8.2, h: 0.35,
    fontSize: 18, bold: true, color: C.white,
    fontFace: 'Cambria',
  });

  // Divider
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.9, y: 2.38, w: 8.1, h: 0.02,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  // Mini symptom table header
  const cols = ['Symptom', 'Duration', 'Severity'];
  cols.forEach((c, ci) => {
    slide.addText(c, {
      x: 0.9 + ci * 2.7, y: 2.48, w: 2.5, h: 0.25,
      fontSize: 10, bold: true, color: C.muted,
      fontFace: 'Calibri',
    });
  });
  // Row
  const rowData = ['Headache', '3 days', '7/10'];
  rowData.forEach((d, ci) => {
    slide.addText(d, {
      x: 0.9 + ci * 2.7, y: 2.76, w: 2.5, h: 0.28,
      fontSize: 12, color: ci === 2 ? C.amber : C.white,
      bold: ci === 2,
      fontFace: 'Calibri',
    });
  });

  // Red flag badge
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9, y: 3.2, w: 3.2, h: 0.36,
    fill: { color: '2a0a0a' },
    line: { color: C.red, pt: 1 },
    rectRadius: 0.08,
  });
  slide.addText('Light sensitivity  ', {
    x: 1.0, y: 3.2, w: 2.0, h: 0.36,
    fontSize: 12, color: C.white, fontFace: 'Calibri',
    valign: 'middle',
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.1, y: 3.27, w: 0.88, h: 0.22,
    fill: { color: '3a0a0a' },
    line: { color: C.red },
    rectRadius: 0.06,
  });
  slide.addText('URGENT', {
    x: 3.1, y: 3.27, w: 0.88, h: 0.22,
    fontSize: 9, bold: true, color: C.red,
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });

  // Print button schematic
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9, y: 3.75, w: 2.2, h: 0.36,
    fill: { color: C.accent },
    line: { color: C.accent },
    rectRadius: 0.08,
  });
  slide.addText('Print / Save as PDF', {
    x: 0.9, y: 3.75, w: 2.2, h: 0.36,
    fontSize: 11, bold: true, color: '0d1f2d',
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
}

// ─── SLIDE 6 — How It Works ───────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('How It Works', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  // Architecture diagram (shapes and arrows)
  const nodes = [
    { label: 'Patient', sub: 'Describes symptoms',   x: 0.3,  y: 2.1 },
    { label: 'FastAPI',  sub: 'Python backend',       x: 2.4,  y: 2.1 },
    { label: 'Claude API', sub: 'Anthropic',          x: 4.5,  y: 2.1 },
    { label: 'Report',   sub: 'Structured JSON',      x: 6.6,  y: 2.1 },
  ];
  const nodeW = 1.6;
  const nodeH = 0.9;

  nodes.forEach(({ label, sub, x, y }) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: nodeW, h: nodeH,
      fill: { color: C.surface },
      line: { color: C.accent, pt: 1.5 },
      rectRadius: 0.1,
    });
    slide.addText(label, {
      x, y: y + 0.1, w: nodeW, h: 0.35,
      fontSize: 13, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center',
    });
    slide.addText(sub, {
      x, y: y + 0.46, w: nodeW, h: 0.3,
      fontSize: 10, color: C.muted,
      fontFace: 'Calibri', align: 'center',
    });
  });

  // Arrows between nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    const ax = nodes[i].x + nodeW;
    const ay = nodes[i].y + nodeH / 2 - 0.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: ax, y: ay, w: 0.8, h: 0.04,
      fill: { color: C.accent }, line: { color: C.accent },
    });
    // Arrowhead
    slide.addShape(pptx.ShapeType.rtTriangle, {
      x: ax + 0.76, y: ay - 0.08, w: 0.14, h: 0.2,
      fill: { color: C.accent }, line: { color: C.accent },
      rotate: 90,
    });
  }

  // Two output branches from Report node
  const reportNode = nodes[3];
  const branchStartX = reportNode.x + nodeW / 2 + 0.05;
  const branchStartY = reportNode.y + nodeH;

  // Vertical connector
  slide.addShape(pptx.ShapeType.rect, {
    x: branchStartX, y: branchStartY, w: 0.04, h: 0.45,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  // Horizontal bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.32, y: branchStartY + 0.43, w: 2.1, h: 0.04,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  // Left branch — "For You"
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.32, y: branchStartY + 0.43, w: 0.04, h: 0.35,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.9, y: branchStartY + 0.8, w: 1.8, h: 0.6,
    fill: { color: C.surface },
    line: { color: C.green, pt: 1.5 },
    rectRadius: 0.1,
  });
  slide.addText('For You', {
    x: 5.9, y: branchStartY + 0.83, w: 1.8, h: 0.28,
    fontSize: 13, bold: true, color: C.green,
    fontFace: 'Calibri', align: 'center',
  });
  slide.addText('Prep Card', {
    x: 5.9, y: branchStartY + 1.1, w: 1.8, h: 0.22,
    fontSize: 10, color: C.muted,
    fontFace: 'Calibri', align: 'center',
  });

  // Right branch — "For Doctor"
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.38, y: branchStartY + 0.43, w: 0.04, h: 0.35,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.65, y: branchStartY + 0.8, w: 1.8, h: 0.6,
    fill: { color: C.surface },
    line: { color: C.accentB, pt: 1.5 },
    rectRadius: 0.1,
  });
  slide.addText('For Doctor', {
    x: 7.65, y: branchStartY + 0.83, w: 1.8, h: 0.28,
    fontSize: 13, bold: true, color: C.accentB,
    fontFace: 'Calibri', align: 'center',
  });
  slide.addText('Clinical Brief', {
    x: 7.65, y: branchStartY + 1.1, w: 1.8, h: 0.22,
    fontSize: 10, color: C.muted,
    fontFace: 'Calibri', align: 'center',
  });
}

// ─── SLIDE 7 — Why We Win ─────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  lightSlide(slide);

  slide.addText('Why We Win', {
    x: 0.6, y: 0.35, w: 9, h: 0.7,
    fontSize: 40, bold: true, color: C.bgDark,
    fontFace: 'Cambria',
  });

  const differentiators = [
    {
      icon: '⬡',
      title: 'Serves Both Sides of the Room',
      body: 'Most health apps help only patients. RxReady generates a patient prep card AND a clinical brief the doctor can read in 30 seconds — one tool, two audiences.',
    },
    {
      icon: '◎',
      title: 'Framed as Questions, Not Diagnoses',
      body: 'Red Flag analysis surfaces important symptoms as questions to ask — never as conclusions. Safe, legally defensible, and empowering without overstepping.',
    },
    {
      icon: '▣',
      title: 'Print-Ready in One Click',
      body: 'The DoctorBrief component includes a full print stylesheet. Clean black-on-white, formatted for a clipboard. Offline. No app required at the appointment.',
    },
  ];

  differentiators.forEach(({ icon, title, body }, i) => {
    const y = 1.35 + i * 1.35;

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.55, y, w: 8.9, h: 1.15,
      fill: { color: C.surface },
      line: { color: C.accent, pt: 1 },
      rectRadius: 0.1,
    });

    // Icon chip
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.8, y: y + 0.32, w: 0.5, h: 0.5,
      fill: { color: C.accent },
      line: { color: C.accent },
    });
    slide.addText(String(i + 1), {
      x: 0.8, y: y + 0.32, w: 0.5, h: 0.5,
      fontSize: 16, bold: true, color: '0d1f2d',
      fontFace: 'Cambria', align: 'center', valign: 'middle',
    });

    // Title
    slide.addText(title, {
      x: 1.5, y: y + 0.1, w: 7.7, h: 0.36,
      fontSize: 16, bold: true, color: C.white,
      fontFace: 'Calibri',
    });

    // Body
    slide.addText(body, {
      x: 1.5, y: y + 0.48, w: 7.7, h: 0.55,
      fontSize: 12, color: C.white,
      fontFace: 'Calibri', wrap: true,
    });
  });
}

// ─── SLIDE 8 — Demo + Ask ─────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  darkSlide(slide);

  // Accent strip
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.22, h: 5.63,
    fill: { color: C.accent },
    line: { color: C.accent },
  });

  // "See it live."
  slide.addText('See it live.', {
    x: 0.55, y: 1.1, w: 9, h: 1.2,
    fontSize: 64, bold: true, color: C.white,
    fontFace: 'Cambria',
  });

  slide.addText('RxReady — hackathon demo', {
    x: 0.55, y: 2.3, w: 9, h: 0.5,
    fontSize: 20, color: C.accent,
    fontFace: 'Calibri', italic: true,
  });

  // Prize callout boxes
  const prizes = [
    { place: '1st Place', amount: '$350 + $500 API Credits' },
    { place: '2nd Place', amount: '$200' },
  ];

  prizes.forEach(({ place, amount }, i) => {
    const px = 0.55 + i * 4.5;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y: 3.25, w: 4.0, h: 1.2,
      fill: { color: C.surface },
      line: { color: i === 0 ? C.accent : C.accentB, pt: 1.5 },
      rectRadius: 0.1,
    });
    slide.addText(place, {
      x: px, y: 3.35, w: 4.0, h: 0.4,
      fontSize: 14, bold: true,
      color: i === 0 ? C.accent : C.accentB,
      fontFace: 'Calibri', align: 'center',
    });
    slide.addText(amount, {
      x: px, y: 3.75, w: 4.0, h: 0.5,
      fontSize: 20, bold: true, color: C.white,
      fontFace: 'Cambria', align: 'center',
    });
  });
}

// ─── Write output ─────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'RxReady_Pitch.pptx');
pptx.writeFile({ fileName: outPath })
  .then(() => console.log(`Deck written to: ${outPath}`))
  .catch(err => { console.error('Error writing deck:', err); process.exit(1); });
