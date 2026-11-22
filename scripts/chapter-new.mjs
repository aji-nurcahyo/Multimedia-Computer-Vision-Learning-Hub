import fs from 'node:fs';
import path from 'node:path';

// Parse CLI arguments
const args = process.argv.slice(2);
let idArg = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--id' && args[i + 1]) {
    idArg = args[i + 1].padStart(2, '0');
    break;
  }
}

if (!idArg) {
  console.error('Usage: npm run chapter:new -- --id <chapter-id-between-01-and-60>');
  process.exit(1);
}

const curriculumPath = path.resolve('content/curriculum/master-curriculum.json');
if (!fs.existsSync(curriculumPath)) {
  console.error('Master curriculum not found!');
  process.exit(1);
}

const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
const chapterMeta = curriculum.chapters.find((c) => c.id === idArg);

if (!chapterMeta) {
  console.error(`Chapter ID "${idArg}" does not exist in master-curriculum.json. Must be between 01 and 60.`);
  process.exit(1);
}

const targetDir = path.resolve('content/chapters', `chapter-${idArg}`);
if (fs.existsSync(targetDir)) {
  console.warn(`Chapter directory already exists: ${targetDir}. Scaffolding aborted to avoid overwriting content.`);
  process.exit(0);
}

fs.mkdirSync(path.join(targetDir, 'examples'), { recursive: true });

// 1. index.md
const indexMd = `# ${chapterMeta.title}

> **Section ${chapterMeta.sectionId}** — ${chapterMeta.sectionTitle}  
> **Estimasi Durasi**: ${chapterMeta.durationMinutes} menit | **Tingkat Kesulitan**: ${chapterMeta.difficulty}

---

## 1. Chapter Overview

Materi pembelajaran komprehensif untuk topik **${chapterMeta.title}**.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa diharapkan mampu:
- Memahami prinsip teoretis dan matematis dari ${chapterMeta.title}.
- Menguasai implementasi komputasi menggunakan Python, NumPy, dan pustaka multimedia terkait.
- Menganalisis parameter operasi dan hasil visualisasi eksperimental.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan telah menguasai:
${chapterMeta.prerequisites.map((p) => `- Chapter ${p}`).join('\n') || '- Dasar pemrograman Python dan NumPy'}

---

## 4. Fundamental Concepts

Penjelasan konsep fundamental...

---

## 5. Mathematical Foundations

Formulasi matematis...

---

## 6. Algorithm Explanation

Langkah komputasi dan pseudocode...

---

## 7. Python Implementation

Implementasi kode Python mandiri dan terstruktur...

---

## 8. Summary

Rangkuman poin-poin esensial bab ini.
`;

fs.writeFileSync(path.join(targetDir, 'index.md'), indexMd, 'utf-8');

// 2. slides.json
const slidesJson = [
  {
    "id": 1,
    "title": chapterMeta.title,
    "lead": `Section ${chapterMeta.sectionId} — ${chapterMeta.sectionTitle}`,
    "body": `### Tujuan Pembelajaran\n- Memahami prinsip dasar ${chapterMeta.title}\n- Menguasai formulasi matematis dan algoritma\n- Mampu mengimplementasikan solusi berbasis Python`,
    "notes": "Slide pembuka dan ikhtisar tujuan kuliah."
  },
  {
    "id": 2,
    "title": "Konsep Fundamental",
    "lead": "Prinsip dasar dan pemodelan matematis",
    "body": "Pemaparan materi utama bab ini...",
    "notes": "Jelaskan definisi dan motivasi di balik konsep ini."
  },
  {
    "id": 3,
    "title": "Rangkuman & Referensi",
    "lead": "Multimedia & Computer Vision Learning Hub",
    "body": "### Poin Kunci\n- Penguasaan konsep teoretis\n- Implementasi praktis pada citra/audio/video",
    "notes": "Tutup sesi dengan sesi tanya jawab."
  }
];
fs.writeFileSync(path.join(targetDir, 'slides.json'), JSON.stringify(slidesJson, null, 2), 'utf-8');

// 3. exercises.json
const exercisesJson = [
  {
    "id": "ex-01",
    "title": `Latihan Komputasi 1: ${chapterMeta.title}`,
    "difficulty": chapterMeta.difficulty,
    "instruction": "Tuliskan kode program Python untuk memverifikasi konsep yang telah dipelajari.",
    "starterCode": "# Tuliskan kode solusi Anda di sini\nimport numpy as np\n",
    "solution": "# Kode solusi referensi\nimport numpy as np\nprint('Done')\n"
  }
];
fs.writeFileSync(path.join(targetDir, 'exercises.json'), JSON.stringify(exercisesJson, null, 2), 'utf-8');

// 4. quiz.json
const quizJson = [
  {
    "id": "q1",
    "question": `Apa konsep utama yang dipelajari pada ${chapterMeta.title}?`,
    "options": [
      "Prinsip pengolahan representasi sinyal dan citra secara digital",
      "Perakitan perangkat keras komputer",
      "Konfigurasi router jaringan nirkabel",
      "Penyusunan basis data relasional murni"
    ],
    "correctIndex": 0,
    "explanation": "Bab ini berfokus pada representasi, analisis matematis, dan algoritma pemrosesan multimedia & visi komputer."
  }
];
fs.writeFileSync(path.join(targetDir, 'quiz.json'), JSON.stringify(quizJson, null, 2), 'utf-8');

// 5. references.json
const referencesJson = [
  {
    "id": "ref-01",
    "title": "Digital Image Processing (4th Edition)",
    "authors": "Rafael C. Gonzalez, Richard E. Woods",
    "year": 2018,
    "publisher": "Pearson",
    "url": "https://www.pearson.com",
    "type": "book"
  }
];
fs.writeFileSync(path.join(targetDir, 'references.json'), JSON.stringify(referencesJson, null, 2), 'utf-8');

// 6. media.json
const mediaJson = [
  {
    "id": `fig-${idArg}-01`,
    "title": `Diagram Ilustrasi ${chapterMeta.title}`,
    "type": "svg",
    "path": `/media/diagrams/chapter-${idArg}-overview.svg`,
    "creator": "Aji Pamungkas Tri Nurcahyo",
    "license": "CC-BY-4.0",
    "source": "Multimedia & Computer Vision Learning Hub, ITERA",
    "attribution": "Ilustrasi asli oleh Aji Pamungkas Tri Nurcahyo (ITERA), lisensi CC-BY-4.0"
  }
];
fs.writeFileSync(path.join(targetDir, 'media.json'), JSON.stringify(mediaJson, null, 2), 'utf-8');

// 7. example-01.py
const examplePy = `"""
Multimedia & Computer Vision Learning Hub
Chapter ${idArg} - ${chapterMeta.title}
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""
import numpy as np

def main():
    print("Executing Chapter ${idArg}: ${chapterMeta.title}")
    # Demonstration code...

if __name__ == "__main__":
    main()
`;
fs.writeFileSync(path.join(targetDir, 'examples/example-01.py'), examplePy, 'utf-8');

console.log(`Successfully scaffolded Chapter ${idArg}: "${chapterMeta.title}" in ${targetDir}`);

