import fs from 'node:fs';
import path from 'node:path';

const chaptersWithContent = [];
const chaptersWithBody = [];
const chaptersWithBullets = [];
const chaptersWithDiagram = [];
const chaptersWithSubtitle = [];

for (let i = 1; i <= 60; i++) {
  const pad = String(i).padStart(2, '0');
  const slidesPath = path.join('content', 'chapters', 'chapter-' + pad, 'slides.json');
  if (fs.existsSync(slidesPath)) {
    const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
    let hasBody = false;
    let hasContent = false;
    let hasBullets = false;
    let hasDiag = false;
    let hasSub = false;

    slides.forEach((s) => {
      if (s.body && s.body.trim()) hasBody = true;
      if (s.content && s.content.trim()) hasContent = true;
      if (s.bullets && s.bullets.length > 0) hasBullets = true;
      if (s.diagram) hasDiag = true;
      if (s.subtitle) hasSub = true;
    });

    if (hasBody) chaptersWithBody.push(pad);
    if (hasContent) chaptersWithContent.push(pad);
    if (hasBullets) chaptersWithBullets.push(pad);
    if (hasDiag) chaptersWithDiagram.push(pad);
    if (hasSub) chaptersWithSubtitle.push(pad);
  }
}

console.log('Chapters using body:', chaptersWithBody.length, chaptersWithBody);
console.log('Chapters using content:', chaptersWithContent.length, chaptersWithContent);
console.log('Chapters using bullets:', chaptersWithBullets.length, chaptersWithBullets);
console.log('Chapters using diagram:', chaptersWithDiagram.length, chaptersWithDiagram);
console.log('Chapters using subtitle:', chaptersWithSubtitle.length, chaptersWithSubtitle);

// Advanced modules slides
for (let i = 1; i <= 8; i++) {
  const adv = 'adv-' + String(i).padStart(2, '0');
  const slidesPath = path.join('content', 'advanced', adv, 'slides.json');
  if (fs.existsSync(slidesPath)) {
    const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
    console.log(adv, 'slides count:', slides.length, 'sample keys:', Object.keys(slides[0]));
  }
}
