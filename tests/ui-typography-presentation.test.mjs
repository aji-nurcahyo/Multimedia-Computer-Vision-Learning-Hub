import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('UI-01 Typography: CSS verification for inline em and figure-caption', () => {
  const cssPath = path.join(rootDir, 'src', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Verify .prose em is NOT display: block
  assert.ok(
    !/\.prose\s+em\s*\{[^}]*display:\s*block/i.test(css),
    'CRITICAL: .prose em must NOT have display: block (breaks inline italic sentences)'
  );

  // Verify .prose em has display: inline or standard inline italic properties
  assert.ok(
    /\.prose\s+em\s*\{[^}]*display:\s*inline/i.test(css) ||
    /\.prose\s+em\s*\{[^}]*font-style:\s*italic/i.test(css),
    '.prose em must have font-style: italic and inline rendering'
  );

  // Verify dedicated .figure-caption class exists
  assert.ok(
    css.includes('.figure-caption'),
    'Dedicated .figure-caption class must be defined in styles.css'
  );

  // Verify H1-H4 heading hierarchy in .prose
  assert.ok(css.includes('.prose h1'), '.prose h1 must be defined');
  assert.ok(css.includes('.prose h2'), '.prose h2 must be defined');
  assert.ok(css.includes('.prose h3'), '.prose h3 must be defined');
  assert.ok(css.includes('.prose h4'), '.prose h4 must be defined');

  // Verify responsive table wrapper in .prose
  assert.ok(css.includes('.table-wrapper'), '.table-wrapper must be defined');
});

test('UI-01 Presentation Viewer: Dual theme CSS tokens verification', () => {
  const cssPath = path.join(rootDir, 'src', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Verify dark theme slide tokens
  assert.ok(
    css.includes('[data-slide-theme="dark"]') || css.includes('.presentation-container,'),
    'Dark theme slide tokens selector must exist'
  );

  // Verify light theme slide tokens
  assert.ok(
    css.includes('[data-slide-theme="light"]'),
    'Light theme slide tokens selector must exist'
  );

  // Verify mandatory slide tokens are declared
  const mandatoryTokens = [
    '--slide-bg',
    '--slide-screen-bg',
    '--slide-header-bg',
    '--slide-border',
    '--slide-title-color',
    '--slide-lead-color',
    '--slide-text-color',
    '--slide-bullet-color',
    '--slide-code-bg',
    '--slide-btn-bg',
    '--slide-notes-bg',
  ];

  for (const token of mandatoryTokens) {
    assert.ok(
      css.includes(token),
      `Mandatory slide theme token ${token} must be defined in styles.css`
    );
  }
});

test('UI-01 Presentation Viewer Component: Zero Reveal.js branding & dual theme support', () => {
  const viewerPath = path.join(rootDir, 'src', 'components', 'PresentationViewer.tsx');
  const viewerSrc = fs.readFileSync(viewerPath, 'utf8');

  // Verify NO Reveal.js branding or classes in viewer
  assert.ok(!viewerSrc.includes('reveal.js'), 'Must have zero Reveal.js branding');
  assert.ok(!viewerSrc.includes('reveal-viewport'), 'Must have zero Reveal.js viewports');

  // Verify theme state and localStorage integration
  assert.ok(
    viewerSrc.includes('slide_theme'),
    'PresentationViewer must support persistent slide_theme in localStorage'
  );
  assert.ok(
    viewerSrc.includes('data-slide-theme'),
    'PresentationViewer must pass data-slide-theme attribute to container'
  );
  assert.ok(
    viewerSrc.includes('toggleSlideTheme') || viewerSrc.includes('setSlideTheme'),
    'PresentationViewer must have theme toggle function'
  );

  // Verify ITERA / Author branding is present
  assert.ok(
    viewerSrc.includes('Institut Teknologi Sumatera (ITERA)'),
    'Presentation footer must contain ITERA branding'
  );
  assert.ok(
    viewerSrc.includes('Aji Pamungkas Tri Nurcahyo'),
    'Presentation footer must contain course author branding'
  );
});

test('UI-01 Markdown Renderer: Inline regex tokenization semantics', () => {
  // Test regex logic identical to MarkdownRenderer.renderInlineText
  const sample = 'Perkembangan ini mencakup pemrosesan sinyal (*multimedia processing pipeline*), ekstraksi fitur (*hand-crafted features*), dan pembelajaran mendalam (*deep learning*).';

  const inlineRegex = /(\$\$[\s\S]+?\$\$|\$(?:\\\$|[^\$\n])+\$|`[^`\n]+`|\[[^\]]+\]\([^\)]+\)|\*\*\*[^\*\n]+\*\*\*|\*\*[^\*\n]+\*\*|\*[^\*\n]+\*|__[^_\n]+__|(?<!\w)_[^_\n]+_(?!\w))/g;
  const parts = sample.split(inlineRegex).filter(Boolean);

  // Must isolate italics with asterisks
  assert.ok(parts.includes('*multimedia processing pipeline*'), 'Should extract (*multimedia processing pipeline*) italic span');
  assert.ok(parts.includes('*hand-crafted features*'), 'Should extract (*hand-crafted features*) italic span');
  assert.ok(parts.includes('*deep learning*'), 'Should extract (*deep learning*) italic span');

  // Surrounding parentheses must stay in neighboring text parts
  assert.ok(parts.some(p => p.includes('(')), 'Parentheses ( must be preserved in neighboring text');
  assert.ok(parts.some(p => p.includes(')')), 'Parentheses ) must be preserved in neighboring text');

  // Combined bold and italic test
  const boldItalic = 'Kombinasi ***sangat penting*** untuk diperhatikan.';
  const biParts = boldItalic.split(inlineRegex).filter(Boolean);
  assert.ok(biParts.includes('***sangat penting***'), 'Should extract ***bold italic***');

  // Underscore bold & italic test
  const altSample = 'Format __tebal__ dan _miring_ alternatif.';
  const altParts = altSample.split(inlineRegex).filter(Boolean);
  assert.ok(altParts.includes('__tebal__'), 'Should extract __bold__');
  assert.ok(altParts.includes('_miring_'), 'Should extract _italic_');
});

test('UI-01 Markdown Renderer: Figure caption regex pattern detection', () => {
  const isExplicitCaption = (text) => /^\*(?:Gambar|Figure|Diagram|Bagan|Tabel)\s+[\d\.]+.*\*$/i.test(text.trim());

  assert.ok(
    isExplicitCaption('*Gambar 1.1 — Diagram alur tahapan konversi sinyal fisik*'),
    'Should identify *Gambar 1.1 — ...* as figure caption'
  );
  assert.ok(
    isExplicitCaption('*Figure 2.3 — Epipolar geometry configuration*'),
    'Should identify *Figure 2.3 — ...* as figure caption'
  );
  assert.ok(
    isExplicitCaption('*Tabel 4.1 — Perbandingan latensi dan throughput*'),
    'Should identify *Tabel 4.1 — ...* as figure caption'
  );
  assert.ok(
    !isExplicitCaption('(*multimedia processing pipeline*)'),
    'Inline term in parentheses must NOT be identified as figure caption'
  );
  assert.ok(
    !isExplicitCaption('*classical algorithmic methods*'),
    'Standard italic phrase must NOT be identified as figure caption'
  );
});

test('UI-01A Math: Inline math tokenization, recursion inside bold/italic, and LaTeX delimiters', () => {
  const inlineRegex =
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\\$|[^\$\n])+\$|\\\([\s\S]+?\\\)|\`[^\`\n]+\`|\[[^\]]+\]\([^\)]+\)|\*\*\*[^\*\n]+\*\*\*|\*\*[^\*\n]+\*\*|\*[^\*\n]+\*|__[^_\n]+__|(?<!\w)_[^_\n]+_(?!\w))/g;

  // 1. Math in ordinary paragraph
  const text1 = 'Variabel bebas $t$ kontinu ($t \\in \\mathbb{R}$) dan $n$ diskrit ($n \\in \\mathbb{Z}$).';
  const parts1 = text1.split(inlineRegex).filter(Boolean);
  assert.ok(parts1.includes('$t$'), 'Should extract $t$');
  assert.ok(parts1.includes('$t \\in \\mathbb{R}$'), 'Should extract $t \\in \\mathbb{R}$');
  assert.ok(parts1.includes('$n$'), 'Should extract $n$');
  assert.ok(parts1.includes('$n \\in \\mathbb{Z}$'), 'Should extract $n \\in \\mathbb{Z}$');

  // 2. Math with sampling period and rate
  const text2 = 'Periode sampling $T_s$ dan frekuensi $f_s = 1/T_s$.';
  const parts2 = text2.split(inlineRegex).filter(Boolean);
  assert.ok(parts2.includes('$T_s$'), 'Should extract $T_s$');
  assert.ok(parts2.includes('$f_s = 1/T_s$'), 'Should extract $f_s = 1/T_s$');

  // 3. Bold text containing math (the exact Chapter 02 bug)
  const boldWithMath1 = '**Sinyal Kontinu $x(t)$**:';
  const partsBold1 = boldWithMath1.split(inlineRegex).filter(Boolean);
  assert.ok(partsBold1.includes('**Sinyal Kontinu $x(t)$**'), 'Should match bold token containing $x(t)$');

  // Verify recursive extraction inside the bold content
  const innerContent1 = partsBold1[0].slice(2, -2);
  const innerParts1 = innerContent1.split(inlineRegex).filter(Boolean);
  assert.ok(innerParts1.includes('$x(t)$'), 'Inner bold content must successfully extract $x(t)$');

  const boldWithMath2 = '**Sinyal Diskrit $x[n]$**:';
  const partsBold2 = boldWithMath2.split(inlineRegex).filter(Boolean);
  assert.ok(partsBold2.includes('**Sinyal Diskrit $x[n]$**'), 'Should match bold token containing $x[n]$');
  const innerContent2 = partsBold2[0].slice(2, -2);
  const innerParts2 = innerContent2.split(inlineRegex).filter(Boolean);
  assert.ok(innerParts2.includes('$x[n]$'), 'Inner bold content must successfully extract $x[n]$');

  // 4. Italic containing math
  const italicMath = '*Kondisi ideal ($f_s \\ge 2 f_{\\max}$)*';
  const partsItalic = italicMath.split(inlineRegex).filter(Boolean);
  const innerItalic = partsItalic[0].slice(1, -1);
  const innerItalicParts = innerItalic.split(inlineRegex).filter(Boolean);
  assert.ok(innerItalicParts.includes('$f_s \\ge 2 f_{\\max}$'), 'Inner italic content must extract math');

  // 5. LaTeX standard delimiters \(...\) and \[...\]
  const latexDelims = 'Sinyal kontinu \\(x(t)\\) dan energi \\[E = mc^2\\] terdefinisi.';
  const partsLatex = latexDelims.split(inlineRegex).filter(Boolean);
  assert.ok(partsLatex.includes('\\(x(t)\\)'), 'Should extract LaTeX inline delimiter \\(x(t)\\)');
  assert.ok(partsLatex.includes('\\[E = mc^2\\]'), 'Should extract LaTeX display delimiter \\[E = mc^2\\]');
});

test('UI-01A Ordered Lists: Sequential numbering and multi-line item integrity', () => {
  const rendererPath = path.join(rootDir, 'src', 'components', 'MarkdownRenderer.tsx');
  const rendererSrc = fs.readFileSync(rendererPath, 'utf8');

  // Verify renderListItemContent exists to handle multi-line/nested list items
  assert.ok(
    rendererSrc.includes('renderListItemContent'),
    'MarkdownRenderer must define renderListItemContent for structured items'
  );

  // Verify <ol start={...}> and <li value={...}> support
  assert.ok(
    rendererSrc.includes('start={isOl ? listStart : undefined}') || rendererSrc.includes('start={'),
    'MarkdownRenderer must support start attribute on ordered list'
  );
  assert.ok(
    rendererSrc.includes('value={item.order}'),
    'MarkdownRenderer must preserve explicit order with value attribute on li'
  );

  // Verify loose list lookahead logic exists (does not flush list on empty line if next is list item)
  assert.ok(
    rendererSrc.includes('listContinues'),
    'MarkdownRenderer must implement list continuation lookahead across blank lines'
  );

  // Verify nested list parsing inside list item
  assert.ok(
    rendererSrc.includes('currentNestedList'),
    'MarkdownRenderer must support nested lists inside list items'
  );
});

test('UI-01A CSS: List hierarchy and nested element margins', () => {
  const cssPath = path.join(rootDir, 'src', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Verify nested list margin rule
  assert.ok(
    css.includes('.prose li > ul') && css.includes('.prose li > ol'),
    'CSS must specify margins for nested lists inside list items'
  );

  // Verify paragraph margin inside list items
  assert.ok(
    css.includes('.prose li > p'),
    'CSS must specify margins for continuation paragraphs inside list items'
  );
});


