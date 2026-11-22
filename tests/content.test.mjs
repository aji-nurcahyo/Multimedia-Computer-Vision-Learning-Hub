import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Master curriculum has 60 unique chapters in order 01 to 60', () => {
  const file = path.resolve('content/curriculum/master-curriculum.json');
  assert.ok(fs.existsSync(file), 'master-curriculum.json exists');
  const curriculum = JSON.parse(fs.readFileSync(file, 'utf-8'));
  assert.equal(curriculum.chapters.length, 60, 'Exactly 60 chapters present');

  for (let i = 1; i <= 60; i++) {
    const expectedId = String(i).padStart(2, '0');
    assert.equal(curriculum.chapters[i - 1].id, expectedId, `Chapter at index ${i-1} has ID ${expectedId}`);
  }
});

test('Learning tracks registry is valid and covers essential tracks', () => {
  const file = path.resolve('content/curriculum/learning-tracks.json');
  assert.ok(fs.existsSync(file), 'learning-tracks.json exists');
  const tracks = JSON.parse(fs.readFileSync(file, 'utf-8'));
  assert.equal(tracks.length, 6, 'Exactly 6 learning tracks present');
  
  const trackIds = tracks.map(t => t.id);
  assert.ok(trackIds.includes('digital-image-processing'));
  assert.ok(trackIds.includes('audio-speech-processing'));
  assert.ok(trackIds.includes('video-processing-tracking'));
  assert.ok(trackIds.includes('computer-vision'));
  assert.ok(trackIds.includes('multimodal-ai'));
  assert.ok(trackIds.includes('realtime-edge-vision'));
});

test('Published chapters (01-60) are complete and pass media, slide, reference, and image checks', () => {
  const file = path.resolve('content/curriculum/master-curriculum.json');
  const curriculum = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const publishedIds = Array.from({ length: 60 }, (_, idx) => String(idx + 1).padStart(2, '0'));

  for (const id of publishedIds) {
    const ch = curriculum.chapters.find(c => c.id === id);
    assert.ok(ch, `Chapter ${id} found in curriculum`);
    assert.equal(ch.status, 'published', `Chapter ${id} is marked as published`);
    assert.equal(ch.resources.slides.status, 'available', `Chapter ${id} presentation link recognizes available slides`);

    const chDir = path.resolve(`content/chapters/chapter-${id}`);
    assert.ok(fs.existsSync(path.join(chDir, 'index.md')), `Chapter ${id} index.md exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'slides.json')), `Chapter ${id} slides.json exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'quiz.json')), `Chapter ${id} quiz.json exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'exercises.json')), `Chapter ${id} exercises.json exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'references.json')), `Chapter ${id} references.json exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'media.json')), `Chapter ${id} media.json exists`);
    assert.ok(fs.existsSync(path.join(chDir, 'examples/example-01.py')), `Chapter ${id} example-01.py exists`);

    const mdContent = fs.readFileSync(path.join(chDir, 'index.md'), 'utf-8');
    const imgMatches = [...mdContent.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
    for (const m of imgMatches) {
      const assetPath = path.resolve('public', m[1].replace(/^\//, ''));
      assert.ok(fs.existsSync(assetPath), `Chapter ${id} referenced diagram exists on disk: ${m[1]}`);
    }

    const slidesRaw = fs.readFileSync(path.join(chDir, 'slides.json'), 'utf-8');
    assert.ok(!/reveal\.js/i.test(slidesRaw), `Chapter ${id} slides contain NO Reveal.js branding`);
    const slides = JSON.parse(slidesRaw);
    assert.ok(slides.length >= 8, `Chapter ${id} slides have at least 8 academic slides (has ${slides.length})`);

    const quiz = JSON.parse(fs.readFileSync(path.join(chDir, 'quiz.json'), 'utf-8'));
    assert.ok(quiz.length >= 5, `Chapter ${id} quiz has at least 5 questions`);

    const exercises = JSON.parse(fs.readFileSync(path.join(chDir, 'exercises.json'), 'utf-8'));
    assert.ok(exercises.length >= 2, `Chapter ${id} has at least 2 guided exercises`);

    const refs = JSON.parse(fs.readFileSync(path.join(chDir, 'references.json'), 'utf-8'));
    assert.ok(refs.length >= 3, `Chapter ${id} has at least 3 verified academic references`);

    const media = JSON.parse(fs.readFileSync(path.join(chDir, 'media.json'), 'utf-8'));
    assert.ok(media.length >= 1, `Chapter ${id} media registry has at least 1 verified asset`);
    for (const asset of media) {
      assert.equal(asset.license, 'CC-BY-4.0', `Chapter ${id} media asset ${asset.id} uses CC-BY-4.0`);
      const diskPath = path.resolve('public', asset.path.replace(/^\//, ''));
      assert.ok(fs.existsSync(diskPath), `Chapter ${id} media asset file exists: ${asset.path}`);
    }
  }
});

