# Academic Attribution & Licensing Guide

## Pedoman Hak Cipta, Lisensi Terbuka & Atribusi Akademik

Platform ini menjunjung tinggi standar integritas akademik. Penggunaan data, gambar, rumus, maupun kutipan wajib mematuhi etika sitasi dan lisensi hak cipta yang berlaku.

---

## 1. Prinsip Utama Penggunaan Media

1. **Prioritaskan Diagram Asli**: Buat diagram vektor SVG sendiri menggunakan Python (Matplotlib), Figma, Inkscape, atau editor visual lainnya.
2. **Hindari Klaim Hak Tanpa Izin**: Suatu gambar yang tersedia di internet tidak otomatis berstatus domain publik. Jangan pernah mengambil gambar dari situs komersial tanpa lisensi tertulis.
3. **Lisensi Terbuka (Creative Commons)**:
   - Apabila menggunakan aset berlisensi **CC-BY-4.0** atau **CC-BY-SA-4.0**, Anda wajib menyertakan nama pencipta asli, judul karya, tautan sumber asli, dan keterangan jika telah dilakukan modifikasi.
   - Cantumkan lisensi secara eksplisit di bawah gambar naskah dan di dalam `media.json`.

---

## 2. Format Keterangan Gambar (Caption Standar)

Di bawah setiap gambar atau diagram pada modul `index.md`, sertakan teks caption dengan struktur:

```text
*Gambar [No Bab].[No Urut] — [Deskripsi Gambar Lengkap].*  
*Sumber: [Nama Pembuat/Organisasi] ([Tahun jika ada]), Lisensi [Tipe Lisensi: CC-BY-4.0 / CC0 / Hak Cipta ITERA].*
```

*Contoh Nyata*:
```markdown
![Mekanisme Spatial Filtering & Konvolusi Diskrit 2D](/media/diagrams/chapter-10-overview.svg)
*Gambar 10.1 — Mekanisme sliding window konvolusi spasial antara citra masukan f(x,y) dan matriks kernel w(s,t).*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*
```

---

## 3. Format Penulisan Sitasi Akademik (`references.json`)

Rujukan pustaka bab harus disusun menurut standar akademik (APA Style / IEEE). Dilarang mengarang sitasi atau tautan DOI palsu.

Struktur objek referensi:
```json
{
  "id": "ref-10-01",
  "title": "Digital Image Processing (4th Edition)",
  "authors": "Rafael C. Gonzalez, Richard E. Woods",
  "year": 2018,
  "publisher": "Pearson Education",
  "url": "https://www.pearson.com",
  "type": "book",
  "annotation": "Rujukan utama pembahasan operasi spasial bab 3."
}
```

