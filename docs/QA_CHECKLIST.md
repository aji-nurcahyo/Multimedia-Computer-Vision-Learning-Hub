# Quality Assurance & Publication Checklist

## Daftar Periksa Pra-Publikasi Bab Baru

Sebelum status sebuah bab diubah dari `"draft"` menjadi `"published"` di dalam `master-curriculum.json`, seluruh butir pemeriksaan di bawah ini wajib diverifikasi dan dipenuhi.

---

## 1. Verifikasi Metadata & Kurikulum

- [ ] Nomor ID bab valid (antara `01` hingga `60`) dan judul sesuai persis dengan silabus master.
- [ ] Durasi pembelajaran dan tingkat kesulitan (`beginner` / `intermediate` / `advanced`) terdefinisi secara realistis.
- [ ] Prasyarat (`prerequisites`) mencantumkan ID bab sebelumnya yang valid.
- [ ] Learning tracks terkait telah ditautkan secara akurat.

---

## 2. Integritas Konten Modul (`index.md`)

- [ ] Memiliki seluruh 9 komponen pedagogis (Overview, Objectives, Prerequisites, Concepts, Math, Algorithm, Python, Summary, References).
- [ ] Seluruh formula matematika KaTeX inline (`$...$`) dan display (`$$...$$`) ter-render dengan rapi tanpa sintaks error.
- [ ] Memuat contoh perhitungan numerik manual langkah demi langkah (*worked example*).
- [ ] Terdapat visualisasi diagram penjelas dengan caption dan atribusi sumber lengkap.

---

## 3. Verifikasi Slide Presentasi (`slides.json`)

- [ ] Memiliki minimal 8 slide dengan struktur perkuliahan yang logis.
- [ ] **Bebas dari watermark atau branding Reveal.js**; menampilkan branding resmi kampus ITERA dan nama pengembang Aji Pamungkas Tri Nurcahyo.
- [ ] Teks tidak mengalami *overflow* atau pemotongan pada rasio 16:9.
- [ ] Setiap slide memiliki catatan presenter (`notes`) untuk memandu pengajar di ruang kelas.

---

## 4. Evaluasi Kuis & Latihan Komputasi

- [ ] Berkas `quiz.json` memuat minimal 3–5 soal pilihan ganda konseptual dan analitis.
- [ ] Setiap soal memiliki kunci jawaban yang valid dan penjelasan akademik mendalam.
- [ ] Berkas `exercises.json` menyediakan instruksi latihan, kode pemula (*starter code*), dan solusi referensi Python.

---

## 5. Verifikasi Media & Atribusi Hak Cipta

- [ ] Seluruh diagram dan gambar yang digunakan tersimpan di direktori `public/media/`.
- [ ] Berkas `media.json` terisi lengkap memuat ID aset, jalur berkas, pembuat, lisensi (CC-BY-4.0), sumber, dan teks atribusi.
- [ ] Script `npm run validate` berhasil dijalankan tanpa peringatan atau error.

---

## 6. Uji Bangun & Tipe Data (Build Verification)

Jalankan perintah pengujian akhir:

```bash
# 1. Jalankan unit test kurikulum
npm test

# 2. Jalankan validasi konten dan aset
npm run validate

# 3. Jalankan typecheck TypeScript
npm run typecheck

# 4. Jalankan kompilasi produksi Vite
npm run build
```

Semua 4 perintah di atas harus menghasilkan **status keluar kode 0 (Exit Code 0)** tanpa galat (zero errors).

