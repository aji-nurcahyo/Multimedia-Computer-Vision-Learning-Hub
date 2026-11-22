# Slide Authoring Guide

## Panduan Penyusunan Slide Presentasi Kuliah

Platform menyediakan penampil slide presentasi bawaan (built-in presentation viewer) yang dirancang untuk kebutuhan ruang kelas dan proyektor akademik. Slide dikelola melalui format JSON terstruktur yang mudah dipelihara.

---

## 1. Lokasi Berkas Slide

Slide setiap bab disimpan di:
`content/chapters/chapter-XX/slides.json`

---

## 2. Struktur Data Slide

Setiap slide direpresentasikan sebagai objek JSON dengan skema berikut:

```json
{
  "id": 1,
  "title": "Judul Slide",
  "lead": "Sub-judul atau ikhtisar ringkas konsep",
  "body": "Poin-poin materi menggunakan sintaks Markdown dan KaTeX...",
  "notes": "Catatan khusus bagi dosen saat menyampaikan materi kuliah."
}
```

### Elemen Data:
- `id` (integer): Urutan penayangan slide (mulai dari 1).
- `title` (string): Judul utama slide. Hindari judul yang terlalu panjang agar tidak terjadi pemotongan teks.
- `lead` (string, opsional): Keterangan pengantar ringkas berwarna aksen.
- `body` (string): Isi slide. Mendukung:
  - Sub-heading (`### Sub Judul`)
  - Poin peluru (`- Butir materi`)
  - Persamaan matematika inline (`$...$`) dan blok (`$$...$$`)
  - Blok kode program ringkas
- `notes` (string, opsional): Catatan instruksional presenter yang dapat dibuka pengajar saat mengajar dengan menekan tombol **N** atau tombol **Catatan**.

---

## 3. Komposisi Slide Kuliah yang Ideal (8–12 Slide per Bab)

Untuk menjaga kedalaman materi dan konsistensi pedagogis, setiap set slide disarankan mencakup:

1. **Slide 1**: Judul Bab, Nama Institusi (ITERA), dan Capaian Perkuliahan.
2. **Slide 2**: Capaian Pembelajaran Terinci (Learning Objectives).
3. **Slide 3**: Motivasi Konsep & Permasalahan Fundamental.
4. **Slide 4**: Landasan Teoretis & Pemodelan Matematis (Persamaan Utama).
5. **Slide 5**: Karakteristik Khusus (misal: Sifat Separabilitas, Normalisasi Bobot).
6. **Slide 6**: Diagram Alir Komputasi / Analisis Kompleksitas Algoritma.
7. **Slide 7**: Contoh Perhitungan Manual (Worked Numerical Example).
8. **Slide 8**: Cuplikan Kode Program Referensi (Python / OpenCV).
9. **Slide 9**: Aplikasi Nyata pada Bidang Industri / Medis / Robotika.
10. **Slide 10**: Rangkuman Poin Kunci & Rujukan Buku Akademik.

---

## 4. Standar Branding Presentasi (Tanpa Reveal.js Branding)

- Antarmuka slide secara otomatis memuat identitas:
  **Multimedia & Computer Vision Learning Hub**  
  **Institut Teknologi Sumatera (ITERA) · Aji Pamungkas Tri Nurcahyo**
- Dilarang menambahkan watermark, logo pihak ketiga, atau teks promosi komersial ke dalam slide perkuliahan.

