# Dokumentasi & Audit Provenansi Dataset (Dataset Documentation & Provenance Sheet)
## Berdasarkan Standar Datasheets for Datasets (Gebru et al.) & NeurIPS Benchmark Guidelines
### Institut Teknologi Sumatera (ITERA)

---

## 1. Metadata Dataset
- **Nama Dataset:** [Contoh: Sumatera Tropical Adverse Visual Dataset (STAVD-2026)]
- **Versi:** [v1.0.0]
- **Tautan Resmi / DOI:** [https://doi.org/... atau URL Repositori]
- **Pembuat / Afiliasi:** [Laboratorium Visi Komputer, ITERA]
- **Lisensi Penggunaan:** [Pilih: CC-BY 4.0 / CC0 / Non-Commercial Academic Research Only]
- **Domain Tugas (Task Domain):** [Object Detection / Multi-Object Tracking / Image Restoration / Depth Estimation]

---

## 2. Motivasi & Tujuan Pembuatan Dataset
- **Untuk tujuan apa dataset ini dibuat?** [Jelaskan gap dunia nyata yang melatarbelakangi pembuatan dataset ini.]
- **Siapa yang mendanai atau memfasilitasi pembuatan dataset?** [Institusi / Hibah Penelitian]

---

## 3. Komposisi & Karakteristik Data
- **Jumlah Total Sampel:** [Contoh: 15.000 citra beranotasi / 120 urutan video]
- **Pemisahan Kanonikal (Canonical Split):**
  - **Training Set:** [Jumlah sampel & persentase, e.g. 10.500 citra (70%)]
  - **Validation Set:** [Jumlah sampel & persentase, e.g. 2.250 citra (15%)]
  - **Test Set (Held-Out):** [Jumlah sampel & persentase, e.g. 2.250 citra (15%)]
- **Format File:** [Contoh: JPEG kualitas 95%, PNG 16-bit uncompressed, MP4 H.264]
- **Resolusi Spasial:** [Min, Rata-rata, Max dalam piksel, misal: 1920x1080 hingga 3840x2160]
- **Distribusi Kelas Objek:**
  | ID Kelas | Nama Label | Jumlah Sampel | Persentase | Status Kemunculan (Head / Tail) |
  |---|---|---|---|---|
  | 0 | Pejalan Kaki | 12.400 | 45.2% | Head Class |
  | 1 | Sepeda Motor | 8.200 | 29.9% | Head Class |
  | 2 | Hewan Ternak | 650 | 2.4% | Long-Tail Class |

---

## 4. Spesifikasi Sensor & Kondisi Lingkungan Akuisisi
- **Perangkat Keras Sensor:** [Tipe sensor CMOS/CCD, model kamera, lensa, focal length]
- **Kondisi Pencahayaan:** [Lux terukur: Siang hari terang (> 50.000 lux), Senja (100–1000 lux), Malam (< 10 lux)]
- **Kondisi Cuaca & Atmosferik:** [Cerah, Hujan Deras, Kabut Asap, Glare Sinar Matahari Langsung]
- **Platform Pemasangan:** [Kamera CCTV Statis / Drone UAV / Kamera Bergerak Kendaraan Patroli]

---

## 5. Proses Pengumpulan Data & Anotasi
- **Mekanisme Anotasi:** [Pilih: Anotasi manual manusia / Semi-otomatis terverifikasi]
- **Jumlah Annotator & Profil:** [Contoh: 5 mahasiswa asisten peneliti terlatih]
- **Pedoman Anotasi (Annotation Guidelines):** [Aturan penanganan objek teroklusi, bounding box tight fitting, objek terpotong frame]
- **Skor Kesepakatan Antar-Annotator (Inter-Annotator Agreement):**
  - Nilai Overlap Rata-rata (Mean IoU): [Contoh: $0.89 \pm 0.04$]
  - Cohen's Kappa Score: [Contoh: $0.92$ (hampir sempurna)]

---

## 6. Audit Galat Label & Integritas Data (Ground-Truth Quality Audit)
- **Toleransi Galat Label:** Kurang dari 0.5% missing label terdeteksi pada 1.000 sampel acak.
- **Pengecekan Kebocoran Data (Data Leakage):** Memastikan frame dari urutan video yang sama tidak terbagi antara training dan test set (split dilakukan pada level video sequence, bukan level frame acak).
- **Verifikasi Checksum SHA-256:**
  - `stavd_train.tar.gz`: `[hash sha256]`
  - `stavd_val.tar.gz`: `[hash sha256]`
  - `stavd_test.tar.gz`: `[hash sha256]`

---

## 7. Aspek Etika, Privasi & Keamanan Data
- **Persetujuan Subjek & Anonimisasi:** Wajah individu dan nomor pelat kendaraan diburamkan secara permanen (irreversible Gaussian blur) sebelum perilisan data publik.
- **Kesesuaian Regulasi:** Mematuhi UU Perlindungan Data Pribadi (UU PDP No. 27/2022) dan pedoman etika riset IEEE.

