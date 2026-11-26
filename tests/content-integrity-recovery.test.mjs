import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getSlideBodyText, getSlideLeadText } from '../src/lib/content.ts';
import { parseSlideBodyToBlocks } from '../src/lib/exportService.ts';

test('CR-01 Slide Schema Resilience: All 600 Core Slides Have Populated Body and Title', () => {
  let totalSlides = 0;
  let populatedBodySlides = 0;

  for (let i = 1; i <= 60; i++) {
    const pad = String(i).padStart(2, '0');
    const slidesPath = path.resolve(`content/chapters/chapter-${pad}/slides.json`);
    assert.ok(fs.existsSync(slidesPath), `slides.json must exist for Chapter ${pad}`);

    const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
    assert.equal(slides.length, 10, `Chapter ${pad} must contain exactly 10 slides`);
    totalSlides += slides.length;

    for (let sIdx = 0; sIdx < slides.length; sIdx++) {
      const slide = slides[sIdx];
      assert.ok(slide.title && slide.title.trim().length > 0, `Ch ${pad} slide ${sIdx + 1} must have title`);
      const body = getSlideBodyText(slide);
      assert.ok(body && body.trim().length > 0, `Ch ${pad} slide ${sIdx + 1} must have non-empty body text`);
      populatedBodySlides++;
    }
  }

  assert.equal(totalSlides, 600, 'Must have exactly 600 canonical Core slides');
  assert.equal(populatedBodySlides, 600, 'All 600 Core slides must have populated body text');
});

test('CR-01 Export Block Fidelity: parseSlideBodyToBlocks Generates Non-Empty Content for All Slides', () => {
  for (let i = 1; i <= 60; i++) {
    const pad = String(i).padStart(2, '0');
    const slidesPath = path.resolve(`content/chapters/chapter-${pad}/slides.json`);
    const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));

    for (let sIdx = 0; sIdx < slides.length; sIdx++) {
      const slide = slides[sIdx];
      const body = getSlideBodyText(slide);
      const blocks = parseSlideBodyToBlocks(body);
      assert.ok(
        blocks.length > 0,
        `Ch ${pad} slide ${sIdx + 1} must produce at least 1 parsed block for export`
      );
    }
  }
});

test('CR-01 PresentationViewer Component: Renders Body, Lead, Ordered Lists, Blockquotes, and Diagrams', () => {
  const viewerSrc = fs.readFileSync(path.resolve('src/components/PresentationViewer.tsx'), 'utf8');

  // Verify normalization helpers
  assert.ok(viewerSrc.includes('getSlideBodyText'), 'PresentationViewer must use getSlideBodyText');
  assert.ok(viewerSrc.includes('getSlideLeadText'), 'PresentationViewer must use getSlideLeadText');

  // Verify diagram rendering
  assert.ok(viewerSrc.includes('currentSlide.diagram'), 'PresentationViewer must support currentSlide.diagram');
  assert.ok(viewerSrc.includes('slide-diagram-wrapper'), 'PresentationViewer must render slide-diagram-wrapper');

  // Verify list and blockquote rendering in renderSlideBody
  assert.ok(viewerSrc.includes('olMatch'), 'renderSlideBody must support numbered ordered lists');
  assert.ok(viewerSrc.includes('slide-blockquote'), 'renderSlideBody must support blockquotes');
});

test('CR-01 Research Tracks Workspace: Restores Tier-B Guided Workflow and Tier-C Code & Notebooks', () => {
  const resSrc = fs.readFileSync(path.resolve('src/components/ResearchTracksView.tsx'), 'utf8');

  // Verify Tier-B guided-workflow.md rendering
  assert.ok(
    resSrc.includes("getResearchText(currentTrack.id, 'guided-workflow.md')"),
    'ResearchTracksView must load guided-workflow.md'
  );
  assert.ok(
    resSrc.includes('Alur Riset Terpandu 8 Tahap (Tier-B Workflow)'),
    'ResearchTracksView must render 8-stage Tier-B workflow card'
  );

  // Verify Tier-C reproducible code & notebook tab
  assert.ok(resSrc.includes("activeTab === 'code'"), 'ResearchTracksView must support code tab');
  assert.ok(
    resSrc.includes("getResearchText(currentTrack.id, 'examples/example-01.py')"),
    'ResearchTracksView must load baseline Python script'
  );
  assert.ok(
    resSrc.includes('-research-baseline.ipynb'),
    'ResearchTracksView must link to research baseline notebook'
  );
});

test('CR-01 Advanced Curriculum Workspace: Provides Presentation Viewer & Notebooks', () => {
  const advSrc = fs.readFileSync(path.resolve('src/components/AdvancedCurriculumView.tsx'), 'utf8');

  // Verify presentation viewer integration
  assert.ok(advSrc.includes('PresentationViewer'), 'AdvancedCurriculumView must import PresentationViewer');
  assert.ok(advSrc.includes("activeTab === 'slides'"), 'AdvancedCurriculumView must support slides tab');
  assert.ok(
    advSrc.includes("getAdvancedJson<any[]>(currentModule.id, 'slides.json')"),
    'AdvancedCurriculumView must load advanced slides.json'
  );

  // Verify notebook reference
  assert.ok(advSrc.includes('-lab.ipynb'), 'AdvancedCurriculumView must reference lab notebook');
});

test('CR-01 Core Reading Material Completeness: 60/60 Non-Empty Chapter Index Files', () => {
  for (let i = 1; i <= 60; i++) {
    const pad = String(i).padStart(2, '0');
    const indexPath = path.resolve(`content/chapters/chapter-${pad}/index.md`);
    assert.ok(fs.existsSync(indexPath), `Chapter ${pad} index.md must exist`);
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.length >= 1500, `Chapter ${pad} index.md must be at least 1500 bytes (got ${content.length})`);
    assert.ok(content.includes('# '), `Chapter ${pad} must contain a markdown heading`);
    assert.ok(content.includes('$'), `Chapter ${pad} must contain mathematical formulas`);
  }
});
