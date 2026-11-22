import fs from 'node:fs';
import path from 'node:path';

const curriculumPath = path.resolve('content/curriculum/master-curriculum.json');
const tracksPath = path.resolve('content/curriculum/learning-tracks.json');
const advancedModulesPath = path.resolve('content/curriculum/advanced-modules.json');
const researchTracksPath = path.resolve('content/curriculum/research-tracks.json');

console.log('=== Validating Curriculum & Content Registry ===');

if (!fs.existsSync(curriculumPath)) {
  console.error('ERROR: master-curriculum.json missing!');
  process.exit(1);
}
if (!fs.existsSync(tracksPath)) {
  console.error('ERROR: learning-tracks.json missing!');
  process.exit(1);
}

const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf-8'));

if (!Array.isArray(curriculum.chapters) || curriculum.chapters.length !== 60) {
  console.error(`ERROR: Expected 60 chapters, found ${curriculum.chapters?.length}`);
  process.exit(1);
}

const chapterIdMap = new Set(curriculum.chapters.map(c => c.id));
let errors = 0;

// Validate track chapter IDs
for (const track of tracks) {
  for (const cid of track.chapterIds) {
    if (!chapterIdMap.has(cid)) {
      console.error(`ERROR: Track "${track.id}" references non-existent chapter ID "${cid}"`);
      errors++;
    }
  }
}

// Validate each chapter
for (const ch of curriculum.chapters) {
  if (!ch.id || !ch.title || !ch.sectionId || !ch.status) {
    console.error(`ERROR: Chapter ${ch.id} missing mandatory attributes`);
    errors++;
  }

  // Check prerequisites
  for (const prereq of (ch.prerequisites || [])) {
    if (!chapterIdMap.has(prereq)) {
      console.error(`ERROR: Chapter ${ch.id} references non-existent prerequisite "${prereq}"`);
      errors++;
    }
  }

  // If published, ensure content files exist
  if (ch.status === 'published') {
    const dir = path.resolve('content', ch.directory);
    if (!fs.existsSync(dir)) {
      console.error(`ERROR: Published chapter ${ch.id} directory not found: ${dir}`);
      errors++;
      continue;
    }

    const requiredFiles = ['index.md', 'slides.json', 'exercises.json', 'quiz.json', 'references.json', 'media.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`ERROR: Published chapter ${ch.id} missing required content file: ${file}`);
        errors++;
      } else {
        // Test JSON parsing
        if (file.endsWith('.json')) {
          try {
            JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          } catch (e) {
            console.error(`ERROR: Malformed JSON in ${filePath}: ${e.message}`);
            errors++;
          }
        }
      }
    }
  }
}

// Validate Advanced Modules & Research Tracks if present
let advModuleCount = 0;
let resTrackCount = 0;

if (fs.existsSync(advancedModulesPath)) {
  const advModules = JSON.parse(fs.readFileSync(advancedModulesPath, 'utf-8'));
  advModuleCount = advModules.length;
  for (const m of advModules) {
    if (!m.id || !m.code || !m.title || !m.status) {
      console.error(`ERROR: Advanced Module ${m.id || 'unknown'} missing mandatory attributes`);
      errors++;
    }
    for (const cid of (m.prerequisites?.coreChapters || [])) {
      if (!chapterIdMap.has(cid)) {
        console.error(`ERROR: Advanced Module ${m.code} references non-existent core chapter "${cid}"`);
        errors++;
      }
    }

    // If published, ensure advanced content files exist
    if (m.status === 'published') {
      const dir = path.resolve('content/advanced', m.id);
      if (!fs.existsSync(dir)) {
        console.error(`ERROR: Published Advanced Module ${m.id} directory not found: ${dir}`);
        errors++;
        continue;
      }

      const requiredFiles = ['index.md', 'slides.json', 'exercises.json', 'quiz.json', 'references.json', 'media.json'];
      for (const file of requiredFiles) {
        const filePath = path.join(dir, file);
        if (!fs.existsSync(filePath)) {
          console.error(`ERROR: Published Advanced Module ${m.id} missing required content file: ${file}`);
          errors++;
        } else if (file.endsWith('.json')) {
          try {
            JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          } catch (e) {
            console.error(`ERROR: Malformed JSON in ${filePath}: ${e.message}`);
            errors++;
          }
        }
      }

      const pyScript = path.join(dir, 'examples', 'example-01.py');
      if (!fs.existsSync(pyScript)) {
        console.error(`ERROR: Published Advanced Module ${m.id} missing Python script: ${pyScript}`);
        errors++;
      }

      const notebook = path.join(dir, 'notebooks', `${m.id}-lab.ipynb`);
      if (!fs.existsSync(notebook)) {
        console.error(`ERROR: Published Advanced Module ${m.id} missing Notebook: ${notebook}`);
        errors++;
      } else {
        try {
          JSON.parse(fs.readFileSync(notebook, 'utf-8'));
        } catch (e) {
          console.error(`ERROR: Malformed Notebook JSON in ${notebook}: ${e.message}`);
          errors++;
        }
      }
    }
  }
}

if (fs.existsSync(researchTracksPath)) {
  const resTracks = JSON.parse(fs.readFileSync(researchTracksPath, 'utf-8'));
  resTrackCount = resTracks.length;
  for (const t of resTracks) {
    if (!t.id || !t.code || !t.title || !t.status) {
      console.error(`ERROR: Research Track ${t.id || 'unknown'} missing mandatory attributes`);
      errors++;
    }
    for (const cid of (t.prerequisites?.coreChapters || [])) {
      if (!chapterIdMap.has(cid)) {
        console.error(`ERROR: Research Track ${t.code} references non-existent core chapter "${cid}"`);
        errors++;
      }
    }

    if (t.status === 'published') {
      const trackDir = path.resolve('content/research', t.id);
      const reqFiles = ['index.md', 'guided-workflow.md', 'manifest.json'];
      for (const rf of reqFiles) {
        const fp = path.join(trackDir, rf);
        if (!fs.existsSync(fp)) {
          console.error(`ERROR: Published Research Track ${t.id} missing required file: ${rf}`);
          errors++;
        }
      }
      const exPy = path.join(trackDir, 'examples', 'example-01.py');
      if (!fs.existsSync(exPy)) {
        console.error(`ERROR: Published Research Track ${t.id} missing Python script: ${exPy}`);
        errors++;
      }
      const nbPath = path.join(trackDir, 'notebooks', `${t.id}-research-baseline.ipynb`);
      if (!fs.existsSync(nbPath)) {
        console.error(`ERROR: Published Research Track ${t.id} missing Notebook: ${nbPath}`);
        errors++;
      }
    }
  }
}

// Validate research templates and manifests
const templatesDir = path.resolve('content/research/templates');
let templateCount = 0;
if (fs.existsSync(templatesDir)) {
  const files = fs.readdirSync(templatesDir);
  templateCount = files.length;
  for (const f of files) {
    if (f.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(path.join(templatesDir, f), 'utf-8'));
      } catch (e) {
        console.error(`ERROR: Malformed JSON in template ${f}: ${e.message}`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`Content validation PASSED: 60 chapters registered, ${tracks.length} core tracks, ${advModuleCount} advanced modules, ${resTrackCount} research tracks, ${templateCount} research templates validated.`);

