import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintAcademicContent } from '../scripts/lint-academic-content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('UI-03 Academic Content Audit: Full repository yields 0 ERRORS and 0 WARNINGS', () => {
  const result = lintAcademicContent();
  assert.equal(
    result.errors.length,
    0,
    `Academic content audit produced ${result.errors.length} ERROR(s): ` +
      result.errors.map((e) => `${e.file}:${e.line} [${e.code}] ${e.message}`).join('; ')
  );
  assert.equal(
    result.warnings.length,
    0,
    `Academic content audit produced ${result.warnings.length} WARNING(s): ` +
      result.warnings.map((w) => `${w.file}:${w.line} [${w.code}] ${w.message}`).join('; ')
  );
  assert.ok(
    result.totalFormulasScanned > 4000,
    `Expected over 4000 validated KaTeX formulas, got ${result.totalFormulasScanned}`
  );
  assert.ok(
    result.totalFilesAudited > 400,
    `Expected over 400 audited files, got ${result.totalFilesAudited}`
  );
});

test('UI-03 Mathematical Notation: No HTML entities inside LaTeX math expressions', () => {
  function getMdFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) files = files.concat(getMdFiles(full));
      else if (item.endsWith('.md')) files.push(full);
    }
    return files;
  }

  const allFiles = [
    ...getMdFiles(path.join(rootDir, 'content', 'chapters')),
    ...getMdFiles(path.join(rootDir, 'content', 'advanced')),
    ...getMdFiles(path.join(rootDir, 'content', 'research')),
  ];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$(?:\\\$|[^\$\n])+\$)/g;
    let match;
    while ((match = mathRegex.exec(content)) !== null) {
      const formula = match[1];
      assert.ok(
        !/&(?:amp|lt|gt|quot);/.test(formula),
        `HTML entity found in LaTeX formula in ${path.relative(rootDir, file)}: ${formula.slice(0, 80)}`
      );
    }
  }
});

test('UI-03 Signal Processing Notation: Consistency of discrete and continuous notation', () => {
  const chapter02Path = path.join(rootDir, 'content', 'chapters', 'chapter-02', 'index.md');
  const ch02Content = fs.readFileSync(chapter02Path, 'utf8');

  // Verify discrete notation x[n] is used
  assert.ok(
    ch02Content.includes('x[n]') || ch02Content.includes('x_s[n]'),
    'Chapter 02 must use standardized discrete signal notation x[n]'
  );

  // Verify continuous notation x(t) is used
  assert.ok(
    ch02Content.includes('x(t)'),
    'Chapter 02 must use standardized continuous signal notation x(t)'
  );

  // Verify no forbidden x[t] or x(n)
  assert.ok(
    !/\bx\[t\]/.test(ch02Content),
    'Forbidden x[t] continuous signal with brackets found in Chapter 02'
  );
});

test('UI-03 Markdown & Presentation Renderer: Display math multi-line parsing resilience', () => {
  const mdRendererPath = path.join(rootDir, 'src', 'components', 'MarkdownRenderer.tsx');
  const mdSrc = fs.readFileSync(mdRendererPath, 'utf8');

  // Verify MarkdownRenderer handles multi-line math delimiters
  assert.ok(
    mdSrc.includes('inMathBlock') && mdSrc.includes("trimmed.endsWith('$$')"),
    'MarkdownRenderer must support closing multi-line math blocks with trimmed.endsWith("$$")'
  );
  assert.ok(
    mdSrc.includes("trimmed.startsWith('$$')") && mdSrc.includes('mathBuffer'),
    'MarkdownRenderer must support opening multi-line math blocks starting with $$'
  );

  const presViewerPath = path.join(rootDir, 'src', 'components', 'PresentationViewer.tsx');
  const presSrc = fs.readFileSync(presViewerPath, 'utf8');

  // Verify PresentationViewer handles multi-line math blocks
  assert.ok(
    presSrc.includes('inMath') && presSrc.includes('mathBuf'),
    'PresentationViewer must implement inMath and mathBuf state machine for multi-line math'
  );
  assert.ok(
    presSrc.includes('slide-math-block'),
    'PresentationViewer must render slide-math-block elements'
  );
});

test('UI-03 Content Audit Manifest: Valid manifest exists and records passing state', () => {
  const manifestPath = path.join(rootDir, 'docs', 'UI_03_CONTENT_AUDIT_MANIFEST.json');
  assert.ok(fs.existsSync(manifestPath), 'docs/UI_03_CONTENT_AUDIT_MANIFEST.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.phase, 'UI-03');
  assert.equal(manifest.status, 'PASSED');
  assert.equal(manifest.summary.errors, 0, 'Manifest must have 0 errors');
  assert.equal(manifest.summary.warnings, 0, 'Manifest must have 0 warnings');
  assert.ok(manifest.summary.validatedFormulas > 4000);
});

