# SILABUS KURIKULUM PENELITIAN JALUR R02 (L4 RESEARCH-READY)
## Robust Multi-Object Tracking & Motion Perception
### State Association Stability, Camera Motion Compensation, and Occlusion Recovery

**Kode Jalur:** R02  
**Kategori:** Primary Academic Anchor  
**Pilar:** Pilar 1: Intelligent Computer Vision  
**Target Akademik:** L4 — Research-Ready (Persiapan Publikasi CVPR / ECCV / IJCV / IEEE T-ITS)  
**Institusi Penyelenggara:** Institut Teknologi Sumatera (ITERA)  
**Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Penyelarasan Strategis:** Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  

---

### 1. Taksonomi Masalah Penelitian (Research Problem Taxonomy)
Penelitian Multi-Object Tracking (MOT) modern diklasifikasikan ke dalam tiga paradigma komputasi utama:
1. **Tracking-by-Detection (TBD):** Paradigma modular terpisah di mana detektor mengekstraksi bounding box pada setiap frame, kemudian modul pelacak mengasosiasikan deteksi antar-frame menggunakan filter spasial dan pencocokan bipartite (contoh: SORT, ByteTrack, BoT-SORT). Keunggulan: fleksibilitas tinggi dan modularitas komponen; kelemahan: rentan terhadap kegagalan propagasi jika detektor melewatkan objek (*missed detection*).
2. **Joint Detection and Embedding (JDE):** Detektor mengekstraksi bounding box sekaligus representasi fitur embedding Re-ID dalam satu forward-pass jaringan neural (contoh: JDE, FairMOT). Keunggulan: efisiensi komputasi tinggi; kelemahan: kompetisi gradien antara tugas lokalisasi geometris dan diskriminasi fitur Re-ID.
3. **Transformer-Based MOT (TrackFormer & MOTR):** Memodelkan asosiasi lintasan secara end-to-end melalui query temporal autoregresif. Keunggulan: tidak memerlukan modul asosiasi heuristik eksternal; kelemahan: kompleksitas pelatihan ekstrem dan performa pada dataset kepadatan tinggi masih tertinggal dari pendekatan TBD berbasis Kalman yang dioptimalkan secara cermat.

Fokus penelitian R02 ditujukan pada: **Stabilitas asosiasi identitas target pada kondisi oklusi jangka panjang dan gerakan kamera dinamis (*camera ego-motion*) dalam pengawasan transportasi cerdas.**

---

### 2. Latar Belakang Ilmiah & SOTA Gap (Scientific Background)
Algoritma TBD klasik mengandalkan Kalman Filter dengan asumsi kamera stasioner dan gerak linear seragam (*constant velocity*). Pada aplikasi nyata (misalnya kamera dasbor kendaraan otonom, drone patroli, atau kamera genggam bergerak), gerakan rotasi dan translasi kamera menyebabkan pergeseran posisi koordinat gambar yang drastis (*ego-motion jitter*). Hal ini merusak estimasi kovariansi Kalman Filter, menyebabkan matriks biaya jarak Euclidean antara prediksi track dan observasi melonjak melampaui batas gating, yang berujung pada fragmentasi lintasan dan lonjakan frekuensi pergantian identitas (*Identity Switches - IDSW*). Celah riset utama adalah: bagaimana mengintegrasikan kompensasi gerak kamera berbiaya rendah dengan strategi asosiasi dua-tahap berbasis deteksi berkeyakinan rendah (*low-confidence recovery*) tanpa melipatgandakan latensi inferensi real-time.

---

### 3. Kajian Literatur & Paper Kunci (Key Literature & Citations)
- **Fondasional:**
  - Bewley, A., et al. "Simple Online and Realtime Tracking (SORT)." *ICIP 2016*. (Penyatuan Kalman Filter dan Hungarian algorithm).
  - Wojke, N., et al. "Simple Online and Realtime Tracking with a Deep Association Metric (DeepSORT)." *ICIP 2017*. (Integrasi embedding Re-ID dan Mahalanobis gating).
  - Bernardin, K., and Stiefelhagen, R. "Evaluating Multiple Object Tracking Performance: The CLEAR MOT Metrics." *EURASIP JIVP 2008*. (Metrik MOTA dan MOTP).
- **Metode Baseline Terkini:**
  - Zhang, Y., et al. "ByteTrack: Multi-Object Tracking by Associating Every Detection Box." *ECCV 2022*. (Asosiasi dua-tahap memanfaatkan deteksi skor rendah).
  - Aharon, N., et al. "BoT-SORT: Robust Associations Multi-Item Tracker." *arXiv:2206.14651 (2022)*. (Integrasi Camera Motion Compensation dan Kalman modifikasi).
  - Luiten, J., et al. "HOTA: A Higher Order Metric for Evaluating Multi-Object Tracking." *IJCV 2021*. (Metrik HOTA pemersatu DetA dan AssA).
- **Dataset Acuan:**
  - Milan, A., et al. "MOT16: A Benchmark for Multi-Object Tracking." *arXiv:1603.00831*. (Standar urutan video pejalan kaki).
  - Dendorfer, P., et al. "MOT20: A Benchmark for Multi Object Tracking in Crowded Scenes." *arXiv:2003.09003*. (Kepadatan pejalan kaki ekstrem).
  - Sun, P., et al. "DanceTrack: Multi-Object Tracking in Uniform Appearance and Diverse Motions." *CVPR 2022*. (Gerakan artikulasi non-linear).

---

### 4. Pertanyaan Penelitian & Hipotesis Teruji (Research Questions & Hypotheses)
- **Research Question 1 (RQ1):** Sejauh mana kompensasi gerak kamera berbasis estimasi afinitas fitur global (GMC) mampu mereduksi frekuensi pergantian identitas (IDSW) pada video dengan ego-motion kamera intensif?
- **Hipotesis ($H_1$):** Penerapan kompensasi gerak kamera matriks affin $2\times 3$ yang dikombinasikan dengan pembobotan asosiasi dua-tahap ByteTrack akan menurunkan frekuensi IDSW minimal sebesar $25\%$ dan meningkatkan metrik HOTA minimal sebesar $+2.0$ poin pada split validasi MOT17 dibandingkan baseline SORT standar, terverifikasi pada $N \ge 3$ random seeds dengan paired t-test ($\alpha = 0.05$).
- **Hipotesis Nol ($H_0$):** Penambahan CMC tidak menghasilkan penurunan IDSW yang signifikan secara statistik atau keuntungan performa terkompensasi oleh degradasi runtime yang melebihi toleransi real-time ($> 30 \text{ ms/frame}$).

---

### 5. Pemilihan & Audit Provenansi Dataset (Dataset Provenance & Audit)
1. **MOT17 Benchmark Challenge:**
   - URL Resmi: `https://motchallenge.net/`
   - Lisensi: CC-BY-NC 4.0 (Non-Commercial Academic Research).
   - Struktur Dataset: 7 video latih dan 7 video uji dengan anotasi manual berfrekuensi 30 FPS.
   - Audit Kualitas: Verifikasi sinkronisasi label identitas antar-frame; penanganan bounding box kelas non-pedestrian (kendaraan, sepeda, patung) sebagai *ignore regions*.
2. **DanceTrack Benchmark:**
   - Lisensi: MIT License.
   - Karakteristik: Penari dengan pakaian seragam (visual appearance identik), menekankan peran dominan asosiasi gerak temporal dibanding Re-ID visual.

---

### 6. Standar Evaluasi Ground-Truth (Ground-Truth Evaluation Standards)
- Anotasi target dinyatakan sebagai lintasan berkelanjutan: $\mathcal{T}_k = \{(t, x_t, y_t, w_t, h_t, \text{ID}_k)\}$.
- Evaluasi IoU Bounding Box Threshold: $\tau_{\text{IoU}} = 0.50$ (sesuai konvensi resmi MOTChallenge).
- Aturan Evaluasi TrackEval Resmi:
  - Bounding box ground-truth yang terpotong tepi gambar dengan visibilitas $< 0.1$ diabaikan.
  - Anotasi statis (seperti bayangan atau pantulan cermin) dikecualikan dari perhitungan metrik deteksi.

---

### 7. Spesifikasi Metode Baseline (Baseline Method Specifications)
- **Detektor Objek:** YOLOX-X (pretrained pada MS COCO dan difine-tune pada data deteksi MOT17).
- **Filter Pelacak:** Kalman Filter linier dengan vektor state 8-dimensi:
  $$\mathbf{x} = [x, y, s, r, \dot{x}, \dot{y}, \dot{s}, \dot{r}]^T$$
  di mana $(x, y)$ adalah titik pusat box, $s = w \cdot h$ adalah skala area, dan $r = w / h$ adalah rasio aspek konstan.
- **Strategi Asosiasi ByteTrack:**
  - Tahap 1: Deteksi skor tinggi ($S_{\text{det}} \ge 0.60$) diasosiasikan ke track aktif via Hungarian matching.
  - Tahap 2: Deteksi skor rendah ($0.10 \le S_{\text{det}} < 0.60$) diasosiasikan ke sisa track yang belum terpasang untuk mencegah fragmentasi saat oklusi.

---

### 8. Fondasi Matematis (Mathematical Foundations)
1. **Dekomposisi Metrik HOTA (Luiten et al., IJCV 2021):**
   $$\text{HOTA}_\alpha = \sqrt{\text{DetA}_\alpha \cdot \text{AssA}_\alpha}$$
   $$\text{DetA}_\alpha = \frac{|\text{TP}|}{|\text{TP}| + |\text{FP}| + |\text{FN}|}, \quad \text{AssA}_\alpha = \frac{1}{|\text{TP}|} \sum_{c \in \text{TP}} \frac{|\text{TPA}(c)|}{|\text{TPA}(c)| + |\text{FPA}(c)| + |\text{FNA}(c)|}$$
   $$\text{HOTA} = \int_0^1 \text{HOTA}_\alpha \, d\alpha \approx \frac{1}{19} \sum_{\alpha \in \{0.05, 0.10, \dots, 0.95\}} \text{HOTA}_\alpha$$
2. **Kompensasi Gerak Kamera (Camera Motion Compensation):**
   Model transformasi afinitas citra 2D antar-frame $t-1$ dan $t$:
   $$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} t_x \\ t_y \end{bmatrix}$$
   Koreksi vektor state Kalman Filter:
   $$\mathbf{x}_{k|k-1}' = M_{\text{affine}} \mathbf{x}_{k|k-1}, \quad P_{k|k-1}' = M_{\text{affine}} P_{k|k-1} M_{\text{affine}}^T$$
3. **Linear Sum Assignment Problem (LSAP):**
   $$\min_{X} \sum_{i=1}^N \sum_{j=1}^M C_{ij} X_{ij} \quad \text{s.t.} \sum_{j} X_{ij} \le 1, \; \sum_{i} X_{ij} \le 1, \; X_{ij} \in \{0, 1\}$$
   dipecahkan secara optimal global menggunakan algoritma Kuhn-Munkres dalam $\mathcal{O}(K^3)$.

---

### 9. Instruksi Reproduksi Baseline Komputasi (Baseline Reproduction Protocol)
1. Pasang pustaka evaluasi resmi: `pip install trackeval`.
2. Unduh sekuens validasi MOT17 dan deteksi publik YOLOX-X.
3. Eksekusi skrip baseline reproduksi:
   ```bash
   python content/research/r02/examples/example-01.py
   ```
4. Verifikasi bahwa algoritma Hungarian menyelesaikan matriks biaya secara optimal dan menghasilkan denda biaya lebih rendah dibanding Greedy assignment.
5. Catat output TrackEval resmi dan pastikan nilai HOTA mencapai $63.1 \pm 0.1\%$.

---

### 10. Variabel Eksperimen & Desain Kontrol (Variables & Experimental Controls)
| Kategori Variabel | Nama Variabel | Konfigurasi Uji |
|---|---|---|
| **Variabel Independen** | Mekanisme Asosiasi & CMC | Greedy vs Hungarian LSAP; No CMC vs ECC vs ORB-GMC |
| **Variabel Dependen** | Kualitas Pelacakan | $\text{HOTA}, \text{DetA}, \text{AssA}, \text{IDF1}, \text{MOTA}, \text{IDSW}$, FPS |
| **Variabel Kontrol** | Bobot Detektor | YOLOX-X MOT17 fine-tuned weights (beku tanpa update gradien) |
| **Variabel Kontrol** | Ambang Batas Deteksi | High threshold $\tau_{\text{high}} = 0.60$, Low threshold $\tau_{\text{low}} = 0.10$ |
| **Variabel Kontrol** | Buffer Lintasan Hilang | Max lost track age $= 30 \text{ frames}$ |

---

### 11. Protokol Validasi Statistik (Gate 6 Multi-Seed Protocol)
- **Random Seeds Minimum ($N \ge 3$):** `[42, 1337, 2026]`.
- Pada proses inferensi deterministik murni, variasi stokastik diinjeksikan melalui simulasi perturbasi deteksi (posisi bounding box jitter Gauss $\sigma \in \{1.5, 2.5\}$ piksel) untuk menguji kestabilan asosiasi di bawah ketidaksempurnaan detektor.
- **Pelaporan:** Rata-rata per-sekuens $\mu \pm \sigma$, uji non-parametrik Wilcoxon signed-rank test untuk distribusi asosiasi per-sekuens yang miring (*skewed*).

---

### 12. Desain Matriks Studi Ablasi (Factorial Ablation Study)
1. **Ablasi 1: Pengaruh Asosiasi Dua-Tahap (First Stage Only vs Two-Stage Byte):**
   - Menguji pemulihan target saat tertutup rintangan sementara.
2. **Ablasi 2: Kompensasi Gerak Kamera (Tanpa CMC vs RANSAC Affine CMC):**
   - Mengisolasi penurunan IDSW murni pada sekuens bergerak (misalnya `MOT17-05` dan `MOT17-10`).
3. **Ablasi 3: Matriks Jarak Asosiasi (IoU Murni vs Fusion Re-ID Cosine Distance):**
   - Menakar keseimbangan antara kecepatan inferensi dan ketahanan oklusi lebih dari 60 frame.

---

### 13. Taksonomi Analisis Galat (MOT Error Taxonomy)
Klasifikasi kegagalan pelacakan ke dalam 4 mode utama:
1. **Identity Switch (IDSW):** Dua lintasan berbeda saling bertukar label identitas saat jarak spasial mendekati nol.
2. **Track Fragmentation (Frag):** Lintasan yang terputus menjadi beberapa segmen independen karena deteksi hilang berturut-turut.
3. **False Positive Track (FP):** Lintasan baru diinisialisasi pada background atau bayangan statis.
4. **False Negative Termination (FN):** Lintasan dihapus prematur karena detektor gagal mendeteksi target yang mengalami perubahan pose mendadak.

---

### 14. Pengujian Kekokohan & Generalisasi Domain (Robustness Testing)
- **Uji Kepadatan Ekstrem:** Evaluasi model pada MOT20 tanpa penyesuaian hiperparameter untuk menguji batas ketahanan solver bipartite saat jumlah query $> 100$ per frame.
- **Uji Oklusi Bertahap:** Menghapus deteksi ground-truth secara buatan selama interval 5 s.d. 60 frame berturut-turut untuk mengukur tingkat pemulihan lintasan (*re-emergence recovery rate*).

---

### 15. Kebutuhan Komputasi & Lingkungan Reproducible (Compute Environment)
- **CPU / GPU:** Intel Core i7 / AMD Ryzen 7 / NVIDIA RTX 3070+ (VRAM $\ge 8 \text{ GB}$).
- **Library Kunci:** `numpy >= 1.24`, `opencv-python >= 4.8`, `lap` atau `scipy.optimize.linear_sum_assignment`, `trackeval`.
- **Target Kecepatan:** $\ge 30 \text{ FPS}$ pada resolusi $1080\text{p}$ untuk menjamin kelayakan deployment sistem transportasi cerdas.

---

### 16. Standar Pelaporan Ilmiah & Format Tabel (Scientific Reporting)
Format tabel wajib berstandar MOTChallenge:
```markdown
| Tracker | Detector | HOTA ↑ | DetA ↑ | AssA ↑ | IDF1 ↑ | MOTA ↑ | IDSW ↓ | Frag ↓ | FPS ↑ |
|---|---|---|---|---|---|---|---|---|---|
| SORT | Faster R-CNN | 39.8 | 36.1 | 44.2 | 55.1 | 59.8 | 1423 | 2050 | **55.2** |
| DeepSORT | Faster R-CNN | 45.4 | 42.0 | 49.3 | 64.7 | 64.2 | 890 | 1240 | 18.4 |
| ByteTrack (Baseline) | YOLOX-X | 63.1 ± 0.1 | 61.5 | 64.9 | 77.8 ± 0.1 | 80.3 ± 0.1 | 2196 | 2277 | 29.6 |
| **Proposed CMC-Track** | YOLOX-X | **64.8 ± 0.1** | **62.3** | **67.6** | **79.5 ± 0.1** | **81.2 ± 0.1** | **1480** | **1620** | 25.1 |
```
*Catatan: Nilai dilaporkan dalam format $\mu \pm \sigma$ dihitung dari $N=3$ random seeds.*

---

### 17. Etika Penelitian & Implikasi Pengawasan (Research Ethics)
- **Etika Pelacakan Warga & Pejalan Kaki:** Pelacakan lintasan publik rentan disalahgunakan untuk pemantauan massal (*mass surveillance*). Seluruh eksperimen wajib menggunakan dataset publik anonim yang telah disetujui komite etik.
- **Kepatuhan Privasi Data:** Dilarang menyimpan fitur biometrik wajah permanen; representasi Re-ID wajib diabstraksikan menjadi vektor embedding spasial berdimensi rendah tanpa kemampuan rekonstruksi identitas individu nyata.

---

### 18. Daftar Periksa Kesiapan Publikasi (Publication-Readiness Checklist)
- [x] Evaluasi menggunakan pustaka resmi `TrackEval` (tidak menggunakan implementasi ad-hoc yang menyimpang).
- [x] Laporan metrik HOTA menyertakan dekomposisi DetA dan AssA secara transparan.
- [x] Analisis ID switches membedakan antara perlintasan target (*cross-over*) dan oklusi latar belakang.
- [x] Pengujian komparasi metode Greedy vs Hungarian divalidasi pada kasus batas (*boundary cases*).
- [x] Protokol multi-seed $N \ge 3$ dipatuhi dan didokumentasikan dalam manifest JSON terstruktur.
- [x] Kode pipeline evaluasi mandiri disediakan tanpa ketergantungan pada API komputasi berbayar.

