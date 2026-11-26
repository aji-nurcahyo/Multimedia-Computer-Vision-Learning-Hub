import fs from 'node:fs';
import path from 'node:path';

const masterPath = path.resolve('content/curriculum/master-curriculum.json');
const tracksPath = path.resolve('content/curriculum/learning-tracks.json');
const advPath = path.resolve('content/curriculum/advanced-modules.json');
const researchPath = path.resolve('content/curriculum/research-tracks.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
const adv = JSON.parse(fs.readFileSync(advPath, 'utf8'));
const research = JSON.parse(fs.readFileSync(researchPath, 'utf8'));

console.log('Auditing Curriculum Content...');
console.log(`Core Chapters: ${master.chapters.length}`);
console.log(`Learning Tracks: ${tracks.length}`);
console.log(`Advanced Modules: ${adv.length}`);
console.log(`Research Tracks: ${research.length}`);

// Audit Chapters
const gapRegister = [];

// Keywords related to telecommunications and engineering context
const telecomKeywords = [
  'telekomunikasi', 'transmisi', 'kanal', 'bandwidth', 'modulasi',
  'noise', 'snr', 'sqnr', 'ber', 'kompresi', 'bitrate', 'throughput',
  'latensi', 'jitter', 'paket', 'streaming', 'sensor', 'iot', 'edge',
  'wireless', 'nirkabel', 'spektrum', 'frekuensi', 'attenuasi', 'fading',
  'channel', 'lossy', 'lossless', 'codec', 'rtp', 'webrtc', 'ofdm'
];

master.chapters.forEach((ch) => {
  const chDir = path.resolve(`content/chapters/chapter-${ch.id}`);
  const mdFile = path.join(chDir, 'index.md');
  const slidesFile = path.join(chDir, 'slides.json');
  const quizFile = path.join(chDir, 'quiz.json');
  const exercisesFile = path.join(chDir, 'exercises.json');
  const refsFile = path.join(chDir, 'references.json');
  const pyFile = path.join(chDir, 'examples/example-01.py');

  if (!fs.existsSync(mdFile)) {
    gapRegister.push({
      id: `GAP-CH${ch.id}-MD`,
      level: 'Core L1/L2',
      target: `Chapter ${ch.id}`,
      severity: 'P0',
      category: 'Completeness',
      description: 'Missing index.md file'
    });
    return;
  }

  const mdContent = fs.readFileSync(mdFile, 'utf8');
  const pyContent = fs.existsSync(pyFile) ? fs.readFileSync(pyFile, 'utf8') : '';
  const refs = fs.existsSync(refsFile) ? JSON.parse(fs.readFileSync(refsFile, 'utf8')) : [];
  const quiz = fs.existsSync(quizFile) ? JSON.parse(fs.readFileSync(quizFile, 'utf8')) : [];
  const exercises = fs.existsSync(exercisesFile) ? JSON.parse(fs.readFileSync(exercisesFile, 'utf8')) : [];

  // Check Telecom connection
  const lowerMd = mdContent.toLowerCase();
  const matchedTelecom = telecomKeywords.filter(kw => lowerMd.includes(kw));

  // Check Math notation quality
  const rawFormulas = (mdContent.match(/\$[^$]+\$/g) || []).length;
  const displayFormulas = (mdContent.match(/\$\$[\s\S]*?\$\$/g) || []).length;

  // Check References quality
  const peerReviewedRefs = refs.filter(r => r.type === 'journal' || r.type === 'conference' || r.type === 'book');

  // Verify learning objectives coverage in text
  const missingObjectives = ch.learningObjectives.filter(obj => {
    const firstWords = obj.split(' ').slice(0, 3).join(' ').toLowerCase();
    return !lowerMd.includes(firstWords);
  });

  // Check Python numerical stability
  const hasDivByZeroRisk = pyContent.includes('/ ') && !pyContent.includes('1e-') && !pyContent.includes('eps');

  if (matchedTelecom.length < 2) {
    gapRegister.push({
      id: `GAP-CH${ch.id}-TELECOM`,
      level: 'Core L1/L2',
      target: `Chapter ${ch.id}`,
      severity: 'P2',
      category: 'Telecom & System Relevance',
      description: `Sparse telecommunications and transmission context (only matched: ${matchedTelecom.join(', ') || 'none'}). Recommend enhancing telecommunications link to ITERA S1 Teknik Telekomunikasi.`,
      matchedKeywords: matchedTelecom
    });
  }

  if (rawFormulas + displayFormulas < 3) {
    gapRegister.push({
      id: `GAP-CH${ch.id}-MATH`,
      level: 'Core L1/L2',
      target: `Chapter ${ch.id}`,
      severity: 'P2',
      category: 'Mathematical Precision',
      description: `Few mathematical expressions (${rawFormulas} inline, ${displayFormulas} display). Ensure formal analytical rigor.`
    });
  }

  if (refs.length < 3) {
    gapRegister.push({
      id: `GAP-CH${ch.id}-REFS`,
      level: 'Core L1/L2',
      target: `Chapter ${ch.id}`,
      severity: 'P2',
      category: 'Scholarly Foundations',
      description: `Fewer than 3 academic references (${refs.length} found).`
    });
  }
});

console.log(`Core Chapters Gaps detected: ${gapRegister.length}`);

// Audit Advanced Modules
adv.forEach((m) => {
  const mDir = path.resolve(`content/advanced/${m.id}`);
  const mdFile = path.join(mDir, 'index.md');
  const pyFile = path.join(mDir, 'examples/example-01.py');
  if (!fs.existsSync(mdFile)) {
    gapRegister.push({
      id: `GAP-ADV-${m.code}-MD`,
      level: 'Advanced L3',
      target: m.code,
      severity: 'P0',
      category: 'Completeness',
      description: `Missing content/advanced/${m.id}/index.md`
    });
  }
});

// Audit Research Tracks
research.forEach((r) => {
  const rDir = path.resolve(`content/research/${r.id}`);
  const mdFile = path.join(rDir, 'index.md');
  if (!fs.existsSync(mdFile)) {
    gapRegister.push({
      id: `GAP-R-${r.code}-MD`,
      level: 'Research L4',
      target: r.code,
      severity: 'P0',
      category: 'Completeness',
      description: `Missing content/research/${r.id}/index.md`
    });
  }
});

console.log(`Total Gaps registered: ${gapRegister.length}`);
console.log('Sample Gaps:');
console.log(JSON.stringify(gapRegister.slice(0, 5), null, 2));
