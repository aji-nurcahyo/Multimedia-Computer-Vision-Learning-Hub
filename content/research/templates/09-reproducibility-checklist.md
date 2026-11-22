# Daftar Periksa Keterulangan Riset (Reproducibility Checklist)
## Diadaptasi dari CVPR / ICCV / NeurIPS Official Reproducibility Standards
### Institut Teknologi Sumatera (ITERA)

---

## Informasi Eksperimen
- **ID Eksperimen:** [Contoh: EXP-R01-2026-001]
- **Judul Makalah / Riset:** [Judul Penelitian]
- **Peneliti / Penguji:** [Nama Peneliti]
- **Tanggal Audit:** [YYYY-MM-DD]
- **Status Audit:** [ ] Lulus Penuh (Pass)  |  [ ] Perlu Perbaikan (Revisions Needed)

---

## 1. Klaim Ilmiah & Hipotesis
- [ ] **1.1** Semua klaim ilmiah utama didukung oleh bukti eksperimental kuantitatif langsung, bukan generalisasi spekulatif.
- [ ] **1.2** Hipotesis kerja dirumuskan secara terukur dan dapat dibuktikan salah (falsifiable).
- [ ] **1.3** Batasan dan kondisi kegagalan model diuraikan secara jujur dan transparan di dalam naskah.

## 2. Dataset & Audit Provenansi
- [ ] **2.1** Tautan unduhan dataset resmi atau DOI disertakan secara lengkap.
- [ ] **2.2** Lisensi penggunaan akademik dataset diverifikasi dan dicantumkan (e.g. CC-BY 4.0, Non-Commercial).
- [ ] **2.3** Pemisahan data (train / validation / test splits) mematuhi benchmark kanonikal resmi tanpa kebocoran data (zero data leakage).
- [ ] **2.4** Nilai checksum SHA-256 dari arsip dataset dicatat untuk verifikasi integritas file.
- [ ] **2.5** Prosedur anonimisasi wajah dan pelat kendaraan telah diterapkan pada data citra publik.

## 3. Lingkungan Komputasi & Dependensi
- [ ] **3.1** File dependensi terkunci (`requirements-lock.txt` atau Dockerfile) disertakan dengan versi library exact.
- [ ] **3.2** Versi Python, PyTorch, CUDA, dan cuDNN dicatat secara eksplisit dalam metadata.
- [ ] **3.3** Fungsi penguncian random seed deterministik (`set_deterministic_seed`) diaktifkan di seluruh worker.
- [ ] **3.4** Spesifikasi hardware komputasi (tipe GPU, kapasitas VRAM, OS) didokumentasikan.

## 4. Pelatihan & Evaluasi Model
- [ ] **4.1** Seluruh hiperparameter pelatihan (learning rate, optimizer, batch size, epochs, decay) dicantumkan lengkap.
- [ ] **4.2** Skrip evaluasi menggunakan pustaka standar industri/akademik resmi (e.g. `pycocotools`, `TrackEval`).
- [ ] **4.3** Model dievaluasi pada minimal $N = 3$ random seeds independen untuk mengukur dispersi stokastik.
- [ ] **4.4** Nilai performa dilaporkan dalam format $\mu \pm \sigma$ beserta interval kepercayaan (95% CI).
- [ ] **4.5** Uji signifikansi statistik (paired t-test / Wilcoxon) dilakukan untuk memvalidasi klaim keunggulan.

## 5. Studi Ablasi & Analisis Kegagalan
- [ ] **5.1** Studi ablasi mengisolasi kontribusi masing-masing modul secara mandiri (One-Factor-at-a-Time).
- [ ] **5.2** Setiap perbaikan metrik akurasi disertai dengan akuntansi biaya komputasi (parameter, FLOPs, latensi).
- [ ] **5.3** Taksonomi galat membedakan kegagalan lokalisasi, klasifikasi, halusinasi latar, dan missing objects.
- [ ] **5.4** Sampel kasus terburuk (worst 5% test cases) divisualisasikan dan dianalisis akar penyebabnya.

## 6. Rilis Kode & Artefak Terbuka
- [ ] **6.1** Kode sumber lengkap dapat dijalankan pada mesin bersih (clean virtualenv) tanpa galat dependensi.
- [ ] **6.2** Bobot model pra-latih (pretrained checkpoints) disediakan pada repositori publik (e.g. HuggingFace / Zenodo).
- [ ] **6.3** Notebook mandiri (Jupyter Notebook / Google Colab) disertakan untuk mereplikasi tabel utama dengan satu klik.
- [ ] **6.4** Skrip pembuatan grafik menyertakan data sumber mentah (raw logging data) tanpa hardcoded plots.

