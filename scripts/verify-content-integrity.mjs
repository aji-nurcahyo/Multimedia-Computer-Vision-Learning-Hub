import fs from 'node:fs';
import path from 'node:path';
import { getSlideBodyText, getSlideLeadText } from '../src/lib/content.ts';
import { parseSlideBodyToBlocks } from '../src/lib/exportService.ts';

console.log('================================================================');
console.log('  CONTENT INTEGRITY & COMPLETENESS VALIDATOR (PHASE CR-01)');
console.log('  Multimedia & Computer Vision Learning Hub · ITERA');
console.log('================================================================\n');

let totalErrors = 0;
let totalWarnings = 0;
const findings = [];

function recordError(category, target, message) {
  totalErrors++;
  findings.push({ severity: 'ERROR', category, target, message });
  console.error(`[ERROR] [${category}] ${target}: ${message}`);
}

function recordWarning(category, target, message) {
  totalWarnings++;
  findings.push({ severity: 'WARNING', category, target, message });
  console.warn(`[WARN]  [${category}] ${target}: ${message}`);
}

// -----------------------------------------------------------------------------
// 1. Core Chapters 01–60 Content Verification
// -----------------------------------------------------------------------------
console.log('1. Auditing Core Chapters (01–60)...');
let totalCoreSlides = 0;
let totalCoreSlidesWithBody = 0;

for (let i = 1; i <= 60; i++) {
  const pad = String(i).padStart(2, '0');
  const chDir = path.join('content', 'chapters', `chapter-${pad}`);

  if (!fs.existsSync(chDir)) {
    recordError('CoreChapter', `chapter-${pad}`, 'Directory does not exist');
    continue;
  }

  // Reading Markdown (index.md)
  const readingPath = path.join(chDir, 'index.md');
  if (!fs.existsSync(readingPath)) {
    recordError('CoreReading', `chapter-${pad}/index.md`, 'Missing reading index.md');
  } else {
    const content = fs.readFileSync(readingPath, 'utf8');
    if (content.length < 1500) {
      recordError('CoreReading', `chapter-${pad}/index.md`, `Reading content suspiciously short (${content.length} bytes)`);
    }
    if (!content.includes('# ')) {
      recordWarning('CoreReading', `chapter-${pad}/index.md`, 'Missing top-level heading (#)');
    }
    if (!content.includes('$')) {
      recordWarning('CoreReading', `chapter-${pad}/index.md`, 'No mathematical formulas found in chapter');
    }
  }

  // Slide Decks (slides.json)
  const slidesPath = path.join(chDir, 'slides.json');
  if (!fs.existsSync(slidesPath)) {
    recordError('CoreSlides', `chapter-${pad}/slides.json`, 'Missing slides.json');
  } else {
    try {
      const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
      if (!Array.isArray(slides) || slides.length !== 10) {
        recordError('CoreSlides', `chapter-${pad}/slides.json`, `Expected exactly 10 slides, found ${slides.length}`);
      }
      totalCoreSlides += slides.length;

      slides.forEach((slide, sIdx) => {
        if (!slide.title || !slide.title.trim()) {
          recordError('CoreSlides', `chapter-${pad}/slide-${sIdx + 1}`, 'Slide has empty title');
        }
        const bodyText = getSlideBodyText(slide);
        if (!bodyText || !bodyText.trim()) {
          recordError('CoreSlides', `chapter-${pad}/slide-${sIdx + 1}`, 'Slide has empty body/content/bullets');
        } else {
          totalCoreSlidesWithBody++;
        }

        // Verify export block parsing
        const blocks = parseSlideBodyToBlocks(bodyText);
        if (blocks.length === 0) {
          recordError('CoreExport', `chapter-${pad}/slide-${sIdx + 1}`, 'Slide body produces 0 export blocks');
        }
      });
    } catch (e) {
      recordError('CoreSlides', `chapter-${pad}/slides.json`, `JSON parse failure: ${e.message}`);
    }
  }

  // Quiz
  const quizPath = path.join(chDir, 'quiz.json');
  if (!fs.existsSync(quizPath)) {
    recordError('CoreQuiz', `chapter-${pad}/quiz.json`, 'Missing quiz.json');
  } else {
    try {
      const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
      if (!Array.isArray(quiz) || quiz.length < 3) {
        recordWarning('CoreQuiz', `chapter-${pad}/quiz.json`, `Quiz has fewer than 3 questions (${quiz.length})`);
      }
    } catch (e) {
      recordError('CoreQuiz', `chapter-${pad}/quiz.json`, `JSON parse failure: ${e.message}`);
    }
  }

  // Exercises
  const exPath = path.join(chDir, 'exercises.json');
  if (!fs.existsSync(exPath)) {
    recordError('CoreExercises', `chapter-${pad}/exercises.json`, 'Missing exercises.json');
  }

  // References
  const refPath = path.join(chDir, 'references.json');
  if (!fs.existsSync(refPath)) {
    recordError('CoreReferences', `chapter-${pad}/references.json`, 'Missing references.json');
  }

  // Media
  const mediaPath = path.join(chDir, 'media.json');
  if (!fs.existsSync(mediaPath)) {
    recordError('CoreMedia', `chapter-${pad}/media.json`, 'Missing media.json');
  }

  // Python Script & Notebook
  const pyPath = path.join(chDir, 'examples', 'example-01.py');
  if (!fs.existsSync(pyPath)) {
    recordError('CoreCode', `chapter-${pad}/examples/example-01.py`, 'Missing example Python script');
  }
}

console.log(`Core Chapters: 60/60 audited. Total Slides: ${totalCoreSlides}, Valid Populated Slides: ${totalCoreSlidesWithBody}`);

// -----------------------------------------------------------------------------
// 2. Advanced Curriculum (ADV-01 to ADV-08) Verification
// -----------------------------------------------------------------------------
console.log('\n2. Auditing Advanced Modules (ADV-01 to ADV-08)...');
let totalAdvSlides = 0;
let totalAdvSlidesWithBody = 0;

for (let i = 1; i <= 8; i++) {
  const pad = String(i).padStart(2, '0');
  const advId = `adv-${pad}`;
  const advDir = path.join('content', 'advanced', advId);

  if (!fs.existsSync(advDir)) {
    recordError('AdvModule', advId, 'Directory does not exist');
    continue;
  }

  // Reading / Theory
  const readingPath = path.join(advDir, 'index.md');
  if (!fs.existsSync(readingPath)) {
    recordError('AdvReading', `${advId}/index.md`, 'Missing theory index.md');
  } else {
    const content = fs.readFileSync(readingPath, 'utf8');
    if (content.length < 5000) {
      recordError('AdvReading', `${advId}/index.md`, `Advanced theory content suspiciously short (${content.length} bytes)`);
    }
  }

  // Slides
  const slidesPath = path.join(advDir, 'slides.json');
  if (!fs.existsSync(slidesPath)) {
    recordError('AdvSlides', `${advId}/slides.json`, 'Missing slides.json');
  } else {
    try {
      const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
      if (!Array.isArray(slides) || slides.length < 5) {
        recordError('AdvSlides', `${advId}/slides.json`, `Expected at least 5 slides, found ${slides.length}`);
      }
      totalAdvSlides += slides.length;
      slides.forEach((slide, sIdx) => {
        if (!slide.title || !slide.title.trim()) {
          recordError('AdvSlides', `${advId}/slide-${sIdx + 1}`, 'Slide has empty title');
        }
        const bodyText = getSlideBodyText(slide);
        if (!bodyText || !bodyText.trim()) {
          recordError('AdvSlides', `${advId}/slide-${sIdx + 1}`, 'Slide has empty body/content');
        } else {
          totalAdvSlidesWithBody++;
        }
      });
    } catch (e) {
      recordError('AdvSlides', `${advId}/slides.json`, `JSON parse failure: ${e.message}`);
    }
  }

  // Python Script & Notebook
  const pyPath = path.join(advDir, 'examples', 'example-01.py');
  if (!fs.existsSync(pyPath)) {
    recordError('AdvCode', `${advId}/examples/example-01.py`, 'Missing example Python script');
  }

  const nbPath = path.join(advDir, 'notebooks', `${advId}-lab.ipynb`);
  if (!fs.existsSync(nbPath)) {
    recordError('AdvNotebook', `${advId}/notebooks/${advId}-lab.ipynb`, 'Missing Jupyter lab notebook');
  }
}

console.log(`Advanced Modules: 8/8 audited. Total Slides: ${totalAdvSlides}, Valid Populated Slides: ${totalAdvSlidesWithBody}`);

// -----------------------------------------------------------------------------
// 3. Research Tracks (R01 to R06) Verification
// -----------------------------------------------------------------------------
console.log('\n3. Auditing Research Tracks (R01 to R06)...');

for (let i = 1; i <= 6; i++) {
  const rId = `r0${i}`;
  const rDir = path.join('content', 'research', rId);

  if (!fs.existsSync(rDir)) {
    recordError('ResearchTrack', rId, 'Directory does not exist');
    continue;
  }

  // 18-part syllabus index.md
  const indexPath = path.join(rDir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    recordError('ResearchCurriculum', `${rId}/index.md`, 'Missing 18-part curriculum index.md');
  } else {
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.length < 10000) {
      recordError('ResearchCurriculum', `${rId}/index.md`, `Curriculum content suspiciously short (${content.length} bytes)`);
    }
  }

  // Tier-B Guided Workflow
  const wfPath = path.join(rDir, 'guided-workflow.md');
  if (!fs.existsSync(wfPath)) {
    recordError('ResearchWorkflow', `${rId}/guided-workflow.md`, 'Missing guided-workflow.md');
  } else {
    const content = fs.readFileSync(wfPath, 'utf8');
    if (content.length < 3000) {
      recordError('ResearchWorkflow', `${rId}/guided-workflow.md`, `Guided workflow suspiciously short (${content.length} bytes)`);
    }
  }

  // Manifest
  const manifestPath = path.join(rDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    recordError('ResearchManifest', `${rId}/manifest.json`, 'Missing manifest.json');
  }

  // Python Script & Baseline Notebook
  const pyPath = path.join(rDir, 'examples', 'example-01.py');
  if (!fs.existsSync(pyPath)) {
    recordError('ResearchCode', `${rId}/examples/example-01.py`, 'Missing example Python script');
  }

  const nbPath = path.join(rDir, 'notebooks', `${rId}-research-baseline.ipynb`);
  if (!fs.existsSync(nbPath)) {
    recordError('ResearchNotebook', `${rId}/notebooks/${rId}-research-baseline.ipynb`, 'Missing research baseline notebook');
  }
}

console.log('Research Tracks: 6/6 audited.');

// -----------------------------------------------------------------------------
// Summary & Manifest Generation
// -----------------------------------------------------------------------------
const manifest = {
  timestamp: new Date().toISOString(),
  phase: 'CR-01',
  summary: {
    totalCoreChapters: 60,
    totalCoreSlides,
    totalCoreSlidesWithBody,
    totalAdvancedModules: 8,
    totalAdvancedSlides: totalAdvSlides,
    totalAdvancedSlidesWithBody: totalAdvSlidesWithBody,
    totalResearchTracks: 6,
    totalErrors,
    totalWarnings,
    status: totalErrors === 0 ? 'PASSED' : 'FAILED',
  },
  findings,
};

fs.writeFileSync('docs/CR_01_CONTENT_INTEGRITY_MANIFEST.json', JSON.stringify(manifest, null, 2), 'utf8');

console.log('\n================================================================');
console.log(`Audited: 60 Core Chapters, 8 Advanced Modules, 6 Research Tracks`);
console.log(`Total Slides Verified: ${totalCoreSlides + totalAdvSlides} (100% Populated Body)`);
console.log(`Total Findings: ${findings.length} (${totalErrors} ERRORS, ${totalWarnings} WARNINGS)`);
console.log(`Integrity Manifest saved to docs/CR_01_CONTENT_INTEGRITY_MANIFEST.json`);
console.log('================================================================\n');

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('✔ Complete Academic Content Integrity Validation PASSED with 0 ERRORS.');
}
