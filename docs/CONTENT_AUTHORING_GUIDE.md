# Content Authoring Guide

## Panduan Penulisan Materi & Persamaan Matematika

Panduan ini disusun untuk dosen dan asisten pengampu mata kuliah Multimedia & Computer Vision dalam menyusun atau menyunting modul bab pembelajaran pada platform.

---

## 1. Lokasi Berkas Konten

Setiap bab tersimpan rapi dalam folder mandiri pada:
`content/chapters/chapter-XX/`

Struktur berkas wajib dalam satu bab:
- `index.md`: Naskah materi pembelajaran lengkap.
- `slides.json`: Slide presentasi kuliah.
- `exercises.json`: Soal latihan komputasi Python.
- `quiz.json`: Soal evaluasi pilihan ganda.
- `references.json`: Daftar rujukan buku dan jurnal.
- `media.json`: Registri atribusi dan hak cipta gambar/diagram.
- `examples/example-01.py`: Kode program Python percontohan.

---

## 2. Format Penulisan Naskah (`index.md`)

Gunakan format Markdown standar yang diperkaya dengan notasi matematika KaTeX.

### A. Judul dan Struktur Standar Bab
Setiap bab harus memuat minimal komponen berikut:
1. `Judul Bab` (H1) dan metadata seksi/durasi.
2. `1. Chapter Overview`: Pengantar topik dan relevansinya.
3. `2. Learning Objectives`: Capaian pembelajaran terukur.
4. `3. Prerequisites`: Pengetahuan prasyarat.
5. `4. Fundamental Concepts`: Konsep dasar dan teori utama.
6. `5. Mathematical Foundations`: Formulasi analitis lengkap.
7. `6. Algorithm Explanation / Worked Example`: Penjelasan langkah komputasi atau perhitungan manual.
8. `7. Python Implementation`: Contoh kode program.
9. `8. Summary`: Rangkuman poin-poin kunci.
10. `9. References`: Rujukan akademik resmi.

### B. Menulis Persamaan Matematika (KaTeX)

- **Matematika Inline**: Gunakan tanda dolar tunggal `$ ... $` di dalam paragraf.  
  *Contoh*: `$f(x, y)$` akan dirender sebagai $f(x, y)$.
- **Matematika Display (Blok Terpisah)**: Gunakan tanda dolar ganda `$$ ... $$` pada baris terpisah.  
  *Contoh*:
  ```markdown
  $$G(x, y) = \frac{1}{2\pi \sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)$$
  ```

### C. Menyisipkan Gambar & Diagram
Gunakan sintaks gambar Markdown:
```markdown
![Deskripsi Diagram Singkat](/media/diagrams/nama-berkas.svg)
*Gambar XX.X — Keterangan gambar lengkap. Sumber: Pengembang/Penulis, Lisensi CC-BY-4.0.*
```
> **Catatan Penting**: Setiap berkas gambar yang disisipkan **wajib** didaftarkan pada berkas `media.json` bab tersebut untuk memenuhi standar atribusi akademik.

### D. Blok Kode Python
Gunakan tiga *backtick* dengan penanda bahasa `python`:
```markdown
```python
import numpy as np

def compute():
    print("Multimedia & Computer Vision")
```
```

---

## 3. Alur Verifikasi Konten Lokal

Setelah selesai menyunting naskah `index.md`:
1. Buka terminal pada root repositori.
2. Jalankan perintah validasi:
   ```bash
   npm run validate
   ```
3. Jika validator melaporkan sukses, jalankan server pratinjau:
   ```bash
   npm run dev
   ```
4. Periksa tampilan rendering di browser pada alamat `http://127.0.0.1:5173`.

