import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

// Node.js test environment reader hooks for content.ts
globalThis.readContentFile = (relPath) => {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return '';
};

globalThis.readContentJson = (relPath) => {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }
  return null;
};

import {
  formatMathToReadableText,
  formatInlineMarkdown,
  parseSlideBodyToBlocks,
  exportPresentationPptx,
  exportPresentationPdf,
  exportChapterPdf,
  getExportCoverageManifest
} from '../src/lib/exportService.ts';

import {
  masterCurriculum,
  getChapterById,
  getChapterText,
  getChapterJson,
  getChapterNotebook,
  getAdvancedText,
  getAdvancedJson,
  getAdvancedNotebook,
  getResearchText,
  getResearchNotebook
} from '../src/lib/content.ts';

// ----------------------------------------------------------------------------
// TEST 1: MATHEMATICAL FORMATTING & PARSING ENGINE
// ----------------------------------------------------------------------------
test('EX-01 Math Engine: Faithful LaTeX to Readable Unicode Translation', () => {
  // Greek letters & symbols
  const latex1 = '\\alpha + \\beta = \\gamma \\times \\lambda';
  const out1 = formatMathToReadableText(latex1);
  assert.equal(out1, 'α + β = γ × λ');

  // Fractions and square roots
  const latex2 = '\\frac{1}{2\\pi} \\sqrt{\\sigma^2}';
  const out2 = formatMathToReadableText(latex2);
  assert.ok(out2.includes('1 / 2π'));
  assert.ok(out2.includes('√(σ²)'));

  // Operators & subscripts
  const latex3 = 'f(x, y) = \\sum_{i=0}^{N-1} x_i \\cdot h_{n-i}';
  const out3 = formatMathToReadableText(latex3);
  assert.ok(out3.includes('∑'));
  assert.ok(out3.includes('·'));
  assert.ok(!out3.includes('$'), 'Must strip dollar signs');
  assert.ok(!out3.includes('\\sum'), 'Must replace LaTeX command');

  // Matrix / vector text wrappers
  const latex4 = '\\mathbf{X} = \\mathbf{U} \\mathbf{\\Sigma} \\mathbf{V}^T';
  const out4 = formatMathToReadableText(latex4);
  assert.ok(out4.includes('X = U Σ Vᵀ'));

  // Inline markdown cleaning
  const md = 'Fungsi intensitas **$f(x, y)$** memiliki nilai $\\le 255$ dan batas *real-time* `33.3 ms`.';
  const cleanMd = formatInlineMarkdown(md);
  assert.ok(cleanMd.includes('f(x, y)'));
  assert.ok(cleanMd.includes('≤ 255'));
  assert.ok(!cleanMd.includes('**'));
  assert.ok(!cleanMd.includes('$'));
  assert.ok(!cleanMd.includes('`'));
});

// ----------------------------------------------------------------------------
// TEST 2: SLIDE BODY PARSING TO STRUCTURED BLOCKS
// ----------------------------------------------------------------------------
test('EX-01 Slide Parser: Converts Markdown to Structured Elements', () => {
  const sampleBody = `### Definisi Konvolusi
- Konvolusi 2D diskrit menerapkan kernel spasial:
$$g(x, y) = \\sum_{s} \\sum_{t} f(s, t) h(x-s, y-t)$$
1. Operasi perkalian elemen-demi-elemen
2. Penjumlahan bobot spasial
\`\`\`python
import cv2
filtered = cv2.filter2D(src, -1, kernel)
\`\`\``;

  const blocks = parseSlideBodyToBlocks(sampleBody);
  assert.ok(blocks.length >= 5, 'Must parse at least 5 structured blocks');

  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].text, 'Definisi Konvolusi');

  assert.equal(blocks[1].type, 'bullet');
  assert.ok(blocks[1].text.includes('Konvolusi 2D diskrit'));

  assert.equal(blocks[2].type, 'math');
  assert.ok(blocks[2].readable.includes('g(x, y)'));

  assert.equal(blocks[3].type, 'numbered');
  assert.equal(blocks[3].num, 1);

  assert.equal(blocks[4].type, 'numbered');
  assert.equal(blocks[4].num, 2);

  assert.equal(blocks[5].type, 'code');
  assert.ok(blocks[5].code.includes('import cv2'));
});

// ----------------------------------------------------------------------------
// TEST 3: POWERPOINT (.pptx) PACKAGE INTEGRITY & OPENXML VALIDATION
// ----------------------------------------------------------------------------
test('EX-01 PPTX Generation: Valid OpenXML Package & Editable Objects for Core Chapters & Advanced', async () => {
  // Test Representative Chapters:
  // 1. Chapter 01 (Introductory)
  // 2. Chapter 10 (Spatial Filtering)
  // 3. Chapter 11 (2D Fourier Transform)
  // 4. Chapter 46 (Vision Transformers)
  const chaptersToTest = ['01', '10', '11', '46'];

  for (const chId of chaptersToTest) {
    const chapter = getChapterById(chId);
    assert.ok(chapter, `Chapter ${chId} must exist`);

    const slides = getChapterJson(chId, chapter.resources.slides.path);
    assert.ok(slides && slides.length > 0, `Slides for Chapter ${chId} must exist`);

    // Generate PPTX in memory
    const buffer = await exportPresentationPptx({
      deckTitle: chapter.title,
      categoryOrTrack: chapter.sectionTitle,
      moduleCode: `Chapter ${chapter.id}`,
      slides,
      outputType: 'nodebuffer'
    });

    assert.ok(buffer && buffer.length > 10000, 'PPTX buffer must be non-empty and sizable');

    // Inspect OpenXML structure via JSZip
    const zip = await JSZip.loadAsync(buffer);

    // 1. Core OpenXML Content Types
    assert.ok(zip.file('[Content_Types].xml'), 'Must contain [Content_Types].xml');
    assert.ok(zip.file('ppt/presentation.xml'), 'Must contain ppt/presentation.xml');

    // 2. Check slide XML files match exact slide count
    for (let s = 1; s <= slides.length; s++) {
      const slideFile = zip.file(`ppt/slides/slide${s}.xml`);
      assert.ok(slideFile, `Must contain ppt/slides/slide${s}.xml for slide ${s}`);

      const slideXml = await slideFile.async('string');

      // Verify editable OpenXML elements
      assert.ok(slideXml.includes('<p:sp>'), 'Slide must contain editable shape elements (<p:sp>)');
      assert.ok(slideXml.includes('<a:t>'), 'Slide must contain text elements (<a:t>)');

      // Verify institutional attribution & author in footer
      assert.ok(
        slideXml.includes('Institut Teknologi Sumatera') || slideXml.includes('ITERA'),
        'Slide must contain ITERA institutional attribution'
      );
      assert.ok(
        slideXml.includes('Aji Pamungkas Tri Nurcahyo'),
        'Slide must contain author attribution'
      );

      // Verify NO Reveal.js branding
      assert.ok(!slideXml.includes('reveal.js'), 'Must NOT contain Reveal.js branding');
      assert.ok(!slideXml.includes('revealjs'), 'Must NOT contain Reveal.js branding');
    }
  }

  // 5. Advanced Module ADV-01 (Linear Algebra & SVD)
  const adv01Slides = getAdvancedJson('adv-01', 'slides.json');
  assert.ok(adv01Slides && adv01Slides.length > 0);

  const advBuffer = await exportPresentationPptx({
    deckTitle: 'Foundations of Computer Vision',
    categoryOrTrack: 'Pilar 1: Fondasi Matematika',
    moduleCode: 'ADV-01',
    slides: adv01Slides,
    outputType: 'nodebuffer'
  });

  const advZip = await JSZip.loadAsync(advBuffer);
  assert.ok(advZip.file('ppt/presentation.xml'));
  assert.ok(advZip.file('ppt/slides/slide1.xml'));
});

// ----------------------------------------------------------------------------
// TEST 4: PRESENTATION PDF FILE INTEGRITY & 16:9 SLIDE COUNT
// ----------------------------------------------------------------------------
test('EX-01 Presentation PDF: Generates Valid Multi-Page 16:9 PDF', () => {
  const chapter = getChapterById('10');
  const slides = getChapterJson('10', chapter.resources.slides.path);

  const pdfBytes = exportPresentationPdf({
    categoryOrTrack: chapter.sectionTitle,
    moduleCode: `Chapter ${chapter.id}`,
    slides,
    outputType: 'arraybuffer'
  });

  assert.ok(pdfBytes && pdfBytes.length > 5000, 'PDF bytes must be non-empty');

  // Verify PDF header magic number %PDF-1.
  const header = Buffer.from(pdfBytes.slice(0, 8)).toString('ascii');
  assert.ok(header.startsWith('%PDF-'), 'Must have valid %PDF- magic header');

  // Verify PDF trailer / EOF
  const tail = Buffer.from(pdfBytes.slice(-64)).toString('ascii');
  assert.ok(tail.includes('%%EOF'), 'Must have valid %%EOF trailer');

  // Verify page objects: count occurrences of "/Type /Page" or "/Type/Page"
  const pdfString = Buffer.from(pdfBytes).toString('binary');
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g) || [];
  assert.equal(
    pageMatches.length,
    slides.length,
    `PDF page count (${pageMatches.length}) must match slide count (${slides.length})`
  );
});

// ----------------------------------------------------------------------------
// TEST 5: COMPLETE CHAPTER PDF GENERATION
// ----------------------------------------------------------------------------
test('EX-01 Complete Chapter PDF: Generates Multi-Page Academic Reading Document', () => {
  const chapter = getChapterById('10');
  const reading = getChapterText('10', chapter.resources.reading.path);
  const references = getChapterJson('10', chapter.resources.references.path);

  const docBytes = exportChapterPdf({
    chapter,
    readingMarkdown: reading,
    references,
    outputType: 'arraybuffer'
  });

  assert.ok(docBytes && docBytes.length > 8000, 'Chapter PDF must be non-empty');

  const header = Buffer.from(docBytes.slice(0, 8)).toString('ascii');
  assert.ok(header.startsWith('%PDF-'));

  const pdfString = Buffer.from(docBytes).toString('binary');
  assert.ok(pdfString.includes('%%EOF'));

  // Complete reading material should span multiple A4 pages
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g) || [];
  assert.ok(pageMatches.length >= 2, `Complete chapter reading must span multiple pages (actual: ${pageMatches.length})`);
});

// ----------------------------------------------------------------------------
// TEST 6: CODE & NOTEBOOK INTEGRITY FOR ALL 74 UNITS
// ----------------------------------------------------------------------------
test('EX-01 Code & Notebook Integrity: All 74 Units Have Real Executable Scripts & Notebooks', () => {
  // 1. Core Chapters 01–60
  masterCurriculum.chapters.forEach((ch) => {
    const py = getChapterText(ch.id, ch.resources.practice.path);
    assert.ok(py && py.trim().length > 50, `Chapter ${ch.id} python practice must be non-empty`);
    assert.ok(py.includes('def ') || py.includes('import ') || py.includes('#!'), `Chapter ${ch.id} must be valid Python`);

    const hasNotebook = parseInt(ch.id, 10) >= 36;
    const nbText = getChapterNotebook(ch.id);
    if (hasNotebook) {
      assert.ok(nbText && nbText.trim().length > 100, `Chapter ${ch.id} notebook must be non-empty`);
      const nb = JSON.parse(nbText);
      assert.ok(Array.isArray(nb.cells) && nb.cells.length > 0, `Chapter ${ch.id} notebook must have cells`);
    } else {
      assert.equal(nbText, '', `Chapter ${ch.id} does not fabricate placeholder ipynb`);
    }
  });

  // 2. Advanced Modules ADV-01..ADV-08
  for (let i = 1; i <= 8; i++) {
    const advId = `adv-0${i}`;
    const py = getAdvancedText(advId, 'examples/example-01.py');
    assert.ok(py && py.trim().length > 50, `${advId} python example must exist`);

    const nbText = getAdvancedNotebook(advId);
    assert.ok(nbText && nbText.trim().length > 100, `${advId} notebook must exist`);
    const nb = JSON.parse(nbText);
    assert.ok(Array.isArray(nb.cells) && nb.cells.length > 0);
  }

  // 3. Research Tracks R01..R06
  for (let i = 1; i <= 6; i++) {
    const rId = `r0${i}`;
    const py = getResearchText(rId, 'examples/example-01.py');
    assert.ok(py && py.trim().length > 50, `${rId} python baseline must exist`);

    const nbText = getResearchNotebook(rId);
    assert.ok(nbText && nbText.trim().length > 100, `${rId} notebook must exist`);
    const nb = JSON.parse(nbText);
    assert.ok(Array.isArray(nb.cells) && nb.cells.length > 0);
  }
});

// ----------------------------------------------------------------------------
// TEST 7: EXPORT COVERAGE MANIFEST COMPLETENESS
// ----------------------------------------------------------------------------
test('EX-01 Export Coverage Manifest: 74 Canonical Entries with Accurate Format Support', () => {
  const manifest = getExportCoverageManifest();

  assert.equal(manifest.length, 74, 'Must cover exactly 74 curriculum units');

  const coreEntries = manifest.filter((m) => m.tier === 'core');
  assert.equal(coreEntries.length, 60);
  coreEntries.forEach((c) => {
    assert.equal(c.formats.pptx, true);
    assert.equal(c.formats.presentationPdf, true);
    assert.equal(c.formats.chapterPdf, true);
    assert.equal(c.formats.pythonCode, true);
    const hasNotebook = parseInt(c.id, 10) >= 36;
    assert.equal(c.formats.jupyterNotebook, hasNotebook);
  });

  const advEntries = manifest.filter((m) => m.tier === 'advanced');
  assert.equal(advEntries.length, 8);
  advEntries.forEach((a) => {
    assert.equal(a.formats.pptx, true);
    assert.equal(a.formats.presentationPdf, true);
    assert.equal(a.formats.chapterPdf, true);
    assert.equal(a.formats.pythonCode, true);
    assert.equal(a.formats.jupyterNotebook, true);
  });

  const resEntries = manifest.filter((m) => m.tier === 'research');
  assert.equal(resEntries.length, 6);
  resEntries.forEach((r) => {
    // Research tracks do not have classroom slide decks
    assert.equal(r.formats.pptx, false);
    assert.equal(r.formats.presentationPdf, false);
    assert.equal(r.formats.chapterPdf, true);
    assert.equal(r.formats.pythonCode, true);
    assert.equal(r.formats.jupyterNotebook, true);
  });
});

// ----------------------------------------------------------------------------
// TEST 8: UI COMPONENT STRUCTURE & CSS AUDIT
// ----------------------------------------------------------------------------
test('EX-01 UI & CSS Audit: PresentationViewer, AcademicExportToolbar and styles.css', () => {
  // 1. PresentationViewer.tsx
  const pvPath = path.resolve('src/components/PresentationViewer.tsx');
  const pvCode = fs.readFileSync(pvPath, 'utf8');
  assert.ok(pvCode.includes('presentation-export-dropdown'), 'Must render export dropdown');
  assert.ok(pvCode.includes('handleExportPptx'), 'Must handle PPTX export');
  assert.ok(pvCode.includes('handleExportPdf'), 'Must handle PDF export');
  assert.ok(pvCode.includes('handlePrint'), 'Must handle Print action');
  assert.ok(pvCode.includes('presentation-export-error-banner'), 'Must render error banner');

  // 2. AcademicExportToolbar.tsx
  const tbPath = path.resolve('src/components/AcademicExportToolbar.tsx');
  const tbCode = fs.readFileSync(tbPath, 'utf8');
  assert.ok(tbCode.includes('academic-export-toolbar'), 'Must render export toolbar container');
  assert.ok(tbCode.includes('Unduh Materi (PDF)'), 'Must render complete doc PDF button');
  assert.ok(tbCode.includes('Unduh Slide (.pptx)'), 'Must render PPTX button');
  assert.ok(tbCode.includes('Python Script (.py)'), 'Must render python download button');
  assert.ok(tbCode.includes('Notebook (.ipynb)'), 'Must render notebook download button');

  // 3. styles.css
  const cssPath = path.resolve('src/styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.includes('.presentation-export-menu'), 'Must style export menu');
  assert.ok(css.includes('.academic-export-toolbar'), 'Must style export toolbar');
  assert.ok(css.includes('.academic-export-btn'), 'Must style export buttons');
  assert.ok(css.includes('@media print'), 'Must include comprehensive print stylesheet');
  assert.ok(css.includes('.presentation-screen'), 'Must include print rules for presentation screen');
});
