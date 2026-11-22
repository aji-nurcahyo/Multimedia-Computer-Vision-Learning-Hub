# SILABUS KURIKULUM PENELITIAN JALUR R01 (L4 RESEARCH-READY)
## Intelligent Visual Detection & Recognition
### Multi-Scale Feature Aggregation, Deformable Attention, and Continuous Uncertainty

**Kode Jalur:** R01  
**Kategori:** Primary Academic Anchor  
**Pilar:** Pilar 1: Intelligent Computer Vision  
**Target Akademik:** L4 — Research-Ready (Persiapan Publikasi CVPR / ICCV / ECCV / TPAMI)  
**Institusi Penyelenggara:** Institut Teknologi Sumatera (ITERA)  
**Arsitek Kurikulum:** Aji Pamungkas Tri Nurcahyo  
**Penyelarasan Strategis:** Roadmap ISVWS 2026–2040 (*Intelligent Sensing & Vision Works / Systems*)  

---

### 1. Taksonomi Masalah Penelitian (Research Problem Taxonomy)
Penelitian deteksi objek modern terbagi ke dalam empat paradigma arsitektur utama:
1. **Detektor Berbasis Anchor Dua-Tahap (Two-Stage Anchor-Based):** Memanfaatkan *Region Proposal Network* (RPN) diikuti klasifikasi dan regresi RoI (contoh: Faster R-CNN, Cascade R-CNN). Kelemahan utama: beban komputasi kuadratik dan sensitivitas tinggi terhadap hiperparameter prior rasio aspek anchor.
2. **Detektor Satu-Tahap Bebas-Anchor (One-Stage Anchor-Free):** Memprediksi titik pusat objek (center-ness) dan regresi jarak 4-sisi secara langsung (contoh: FCOS, CenterNet, YOLOX). Mengeliminasi bias anchor tetapi rentan terhadap ambiguitas fitur pada objek bertumpuk (*crowded scenes*).
3. **Detektor Berbasis Set-Prediction Transformer (DETR):** Menggunakan encoder-decoder Transformer dengan bipartite Hungarian matching untuk mengeliminasi Non-Maximum Suppression (NMS). Kelemahan historis: konvergensi lambat (500 epoch) dan resolusi spasial terbatas akibat kompleksitas atensi global $\mathcal{O}(H^2 W^2)$.
4. **Detektor Atensi Deformabel Multi-Skala (Deformable DETR & Sparse R-CNN):** Membatasi sampling atensi pada $K$ titik kunci di seluruh level piramida fitur, mencapai konvergensi cepat (50 epoch) dan akurasi tinggi pada objek kecil.

Fokus penelitian R01 ditujukan pada tantangan spesifik: **Preservasi representasi fitur spasial objek berskala kecil ($< 16 \times 16$ piksel) pada citra drone/udara dan pemantauan maritim Sumatera.**

---

### 2. Latar Belakang Ilmiah & SOTA Gap (Scientific Background)
Piramida fitur standar (FPN) menghasilkan representasi hierarkis melalui downsampling konvolusi bertingkat ($P_3$ s.d. $P_7$). Namun, saat objek kecil melewati downsampling stride $32\times$, informasi geometrisnya terkompresi menjadi sub-piksel tunggal yang rentan tereliminasi oleh pooling atau konvolusi strided. Meskipun atensi Transformer mampu memodelkan konteks global jangka panjang, kompleksitas komputasinya melarang komputasi self-attention langsung pada resolusi tinggi ($P_2$ atau $P_3$). Terdapat celah ilmiah (*research gap*) nyata: bagaimana merancang mekanisme agregasi fitur multi-skala yang mampu mengalirkan detail geometris resolusi tinggi ke query objek tanpa meningkatkan kompleksitas memori GPU melampaui batas praktis inferensi tepi.

---

### 3. Kajian Literatur & Paper Kunci (Key Literature & Citations)
- **Fondasional:**
  - Lin, T.-Y., et al. "Feature Pyramid Networks for Object Detection." *CVPR 2017*. (Fondasi FPN multi-skala).
  - Lin, T.-Y., et al. "Focal Loss for Dense Object Detection." *ICCV 2017*. (Mengatasi ketidakseimbangan kelas ekstrem).
  - Carion, N., et al. "End-to-End Object Detection with Transformers (DETR)." *ECCV 2020*. (Paradigma set prediction tanpa NMS).
- **Metode Baseline Terkini:**
  - Zhu, X., et al. "Deformable DETR: Deformable Transformers for End-to-End Object Detection." *ICLR 2021*. (Sampling sparse atensi deformabel multi-skala).
  - Ge, Z., et al. "YOLOX: Exceeding YOLO Series in 2021." *arXiv:2107.08430*. (Baseline anchor-free berkecepatan tinggi).
  - Bolya, D., et al. "TIDE: A General Toolbox for Identifying Object Detection Errors." *ECCV 2020*. (Kerangka formal dekomposisi galat deteksi).
- **Dataset Acuan:**
  - Lin, T.-Y., et al. "Microsoft COCO: Common Objects in Context." *ECCV 2014*. (Standar evaluasi 80-kelas).
  - Zhu, P., et al. "VisDrone-DET: The Vision Meets Drone Object Detection Benchmark." *IEEE TPAMI 2021*. (Benchmark objek kecil udara).

---

### 4. Pertanyaan Penelitian & Hipotesis Teruji (Research Questions & Hypotheses)
- **Research Question 1 (RQ1):** Apakah penambahan sampling atensi deformabel multi-skala pada tingkat piramida $P_2$ ($4\times$ downsampling) menghasilkan peningkatan $\text{AP}_S$ yang signifikan secara statistik di atas fluktuasi stokastik pelatihan?
- **Hipotesis ($H_1$):** Penerapan modul *Deformable Cross-Attention* dengan 4 sampling offsets pada level fitur $P_2$ meningkatkan metrik $\text{AP}_S$ pada subset objek kecil MS COCO minimal sebesar $+2.0\%$ dibandingkan baseline Deformable DETR standar ($P_3$–$P_6$) pada taraf signifikansi $\alpha = 0.05$ (Paired Student's t-test over $N \ge 3$ random seeds).
- **Hipotesis Nol ($H_0$):** Perbedaan $\text{AP}_S$ antara model yang diusulkan dan baseline $\le 0$ atau tidak dapat dibedakan dari variansi antar-seed acak.

---

### 5. Pemilihan & Audit Provenansi Dataset (Dataset Provenance & Audit)
1. **MS COCO 2017 Object Detection:**
   - URL Resmi: `https://cocodataset.org/`
   - Lisensi: Creative Commons Attribution 4.0 International (CC-BY 4.0).
   - Pemisahan: `train2017` (118.287 citra), `val2017` (5.000 citra kanonikal).
   - Audit Kualitas: Verifikasi ketiadaan bounding box dengan lebar atau tinggi $\le 0$ piksel; filtering bounding box yang keluar dari batas kanvas gambar.
2. **VisDrone-DET Benchmark:**
   - Lisensi: Academic Non-Commercial Research Use.
   - Karakteristik Sensor: Citra kamera drone resolusi $1920 \times 1080$, sudut elevasi bervariasi ($30^\circ$ s.d. $90^\circ$), dominasi objek $< 16 \times 16$ piksel.

---

### 6. Standar Evaluasi Ground-Truth (Ground-Truth Evaluation Standards)
- Anotasi koordinat dinyatakan dalam format $[x_{\min}, y_{\min}, w, h]$ atau $[x_1, y_1, x_2, y_2]$.
- Batasan Skala Objek Berdasarkan Konvensi COCO:
  - **Small ($\text{AP}_S$):** $\text{Area} < 32^2$ piksel ($< 1024 \text{ px}^2$).
  - **Medium ($\text{AP}_M$):** $32^2 \le \text{Area} \le 96^2$ piksel ($1024 \le \text{Area} \le 9216 \text{ px}^2$).
  - **Large ($\text{AP}_L$):** $\text{Area} > 96^2$ piksel ($> 9216 \text{ px}^2$).
- Toleransi Kesalahan Anotasi: Evaluasi margin annotator $I_{\text{margin}} = 2 \text{ px}$. Objek dengan ambiguitas tinggi diberi flag `iscrowd = 1` dan diabaikan dari penalti False Positive.

---

### 7. Spesifikasi Metode Baseline (Baseline Method Specifications)
- **Arsitektur:** Deformable DETR (ResNet-50 backbone pretrained pada ImageNet-1K).
- **Tingkat Piramida Fitur:** 4 level ($C_3, C_4, C_5$ dari backbone + konvolusi stride-2 $3\times 3$ untuk $C_6$).
- **Jumlah Query Objek:** $N_q = 300$ queries.
- **Fungsi Kerugian (Loss Function):**
  $$\mathcal{L}(y, \hat{y}) = \lambda_{\text{cls}} \mathcal{L}_{\text{focal}}(\hat{p}, c) + \lambda_{\text{L1}} \|b - \hat{b}\|_1 + \lambda_{\text{giou}} \mathcal{L}_{\text{giou}}(b, \hat{b})$$
  dengan koefisien bobot standar: $\lambda_{\text{cls}} = 2.0, \lambda_{\text{L1}} = 5.0, \lambda_{\text{giou}} = 2.0$.

---

### 8. Fondasi Matematis (Mathematical Foundations)
1. **Multi-Scale Deformable Attention:**
   $$\text{MSDeformAttn}(z_q, \hat{p}_q, \{x^l\}_{l=1}^L) = \sum_{m=1}^M W_m \left[ \sum_{l=1}^L \sum_{k=1}^K A_{mq l k} \cdot W_m' x^l(\phi_l(\hat{p}_q) + \Delta p_{mq l k}) \right]$$
   di mana $M$ adalah jumlah attention heads, $L$ adalah level fitur, $K$ adalah jumlah titik sampling per level, $\Delta p_{mq l k}$ adalah sampling offset kontinu yang dipelajari, dan $A_{mq l k} \in [0, 1]$ adalah bobot atensi ternormalisasi softmax.
2. **Interpolasi 101-Titik COCO-Style AP:**
   $$\text{AP} = \frac{1}{101} \sum_{r \in \{0.00, 0.01, \dots, 1.00\}} p_{\text{interp}}(r), \quad p_{\text{interp}}(r) = \max_{\tilde{r} \ge r} p(\tilde{r})$$
3. **Generalized Intersection over Union (GIoU):**
   $$\text{GIoU} = \text{IoU} - \frac{|C \setminus (A \cup B)|}{|C|}$$
   di mana $C$ adalah convex hull terkecil yang melingkupi kotak $A$ dan $B$.

---

### 9. Instruksi Reproduksi Baseline Komputasi (Baseline Reproduction Protocol)
1. Kloning repositori resmi: `git clone https://github.com/fundamentalvision/Deformable-DETR.git`.
2. Pasang dependensi CUDA C++ operator: `python setup.py build install`.
3. Kunci seed deterministik di seluruh modul:
   ```python
   torch.manual_seed(seed)
   torch.cuda.manual_seed_all(seed)
   np.random.seed(seed)
   random.seed(seed)
   torch.backends.cudnn.deterministic = True
   torch.backends.cudnn.benchmark = False
   ```
4. Jalankan evaluasi baseline pada MS COCO `val2017`:
   - Verifikasi bahwa hasil evaluasi lokal mencapai $\text{mAP} = 43.8 \pm 0.1\%$ dan $\text{AP}_S = 26.4 \pm 0.2\%$.

---

### 10. Variabel Eksperimen & Desain Kontrol (Variables & Experimental Controls)
| Kategori Variabel | Nama Variabel | Nilai / Konfigurasi |
|---|---|---|
| **Variabel Independen** | Sampling Offset Mechanism | Standar Bilinear Grid vs Deformable 4-Point Sampling |
| **Variabel Dependen** | Performa Deteksi & Efisiensi | $\text{mAP}@[.50:.95], \text{AP}_S, \text{AP}_M, \text{AP}_L$, Latensi P95 (ms), GFLOPs |
| **Variabel Kontrol** | Backbone & Bobot Pretrained | ResNet-50 ImageNet-1K (Torchvision weights v1) |
| **Variabel Kontrol** | Optimizer & Learning Rate | AdamW, $\text{lr} = 2 \times 10^{-4}$, weight decay $1 \times 10^{-4}$ |
| **Variabel Kontrol** | Batch Size & Input Canvas | Batch size 16, resolusi $800 \times 1333$ piksel |

---

### 11. Protokol Validasi Statistik (Gate 6 Multi-Seed Protocol)
- **Jumlah Seed Acak Minimum ($N \ge 3$):** `seeds = [42, 1337, 2026]`.
- **Format Pelaporan Wajib:**
  $$\text{Nilai Akhir} = \mu \pm \sigma \quad (95\% \text{ Bootstrap CI: } [q_{0.025}^*, q_{0.975}^*])$$
  di mana $\sigma$ dihitung menggunakan koreksi Bessel ($N-1$).
- **Uji Signifikansi:** Paired Student's t-test untuk menguji apakah selisih performa antar-metode pada seed yang sama berbeda signifikan secara statistik dari nol.

---

### 12. Desain Matriks Studi Ablasi (Factorial Ablation Study)
1. **Ablasi 1: Dampak Resolusi Skala Piramida Fitur ($P_2$ vs $P_3$):**
   - Menilai peningkatan $\text{AP}_S$ berbanding pertambahan konsumsi VRAM GPU.
2. **Ablasi 2: Jumlah Titik Sampling Deformabel ($K \in \{2, 4, 8\}$):**
   - Mengukur batas saturasi performa representasi atensi lokal.
3. **Ablasi 3: Pengaruh Formulasi Loss Lokalisasi (Smooth L1 vs GIoU):**
   - Membandingkan kekokohan gradien terhadap bounding box berukuran sub-piksel.

---

### 13. Taksonomi Analisis Galat (TIDE Error Analysis Framework)
Dekomposisi kegagalan model deteksi ke dalam 5 kategori ortogonal (Bolya et al., ECCV 2020):
1. **Localization Error ($\Delta \text{AP}_{\text{loc}}$):** $\text{IoU} \in [0.1, 0.5)$ dengan kelas benar.
2. **Classification Error ($\Delta \text{AP}_{\text{cls}}$):** $\text{IoU} \ge 0.5$ tetapi label kategori salah.
3. **Both (Cls + Loc) Error ($\Delta \text{AP}_{\text{both}}$):** $\text{IoU} \in [0.1, 0.5)$ dan kategori salah.
4. **Duplicate Detection Error ($\Delta \text{AP}_{\text{dup}}$):** Kotak prediksi berlebih pada objek yang sudah terdeteksi.
5. **Background False Positive ($\Delta \text{AP}_{\text{bkg}}$):** Prediksi pada background murni ($\text{IoU} < 0.1$).
6. **Missed Ground-Truth ($\Delta \text{AP}_{\text{miss}}$):** Target ground-truth yang tidak memiliki kandidat deteksi sama sekali.

---

### 14. Pengujian Kekokohan & Generalisasi Domain (Robustness Testing)
- **Evaluasi Cross-Domain:** Model yang dilatih pada MS COCO diuji secara zero-shot pada dataset drone VisDrone-DET tanpa fine-tuning untuk mengukur *Domain Drop*:
  $$\text{Drop}_{\text{domain}} = \frac{\text{mAP}_{\text{COCO}} - \text{mAP}_{\text{VisDrone}}}{\text{mAP}_{\text{COCO}}} \times 100\%$$
- **Uji Ketahanan Derau Sensor:** Menambahkan derau Gaussian additive ($\sigma \in \{5, 10, 20\}$) dan blur lensa untuk mengukur stabilitas koordinat bounding box.

---

### 15. Kebutuhan Komputasi & Lingkungan Reproducible (Compute Environment)
- **Hardware Minimum:** 1x NVIDIA GPU dengan VRAM $\ge 12 \text{ GB}$ (RTX 3060/3080/4090 atau A100).
- **Sistem Operasi:** Linux Ubuntu 22.04 LTS / Windows 11 dengan WSL2.
- **Python Stack:** Python 3.10+, PyTorch 2.4.0+, CUDA 12.1+, `pycocotools 2.0.7`, `torchvision 0.19.0`.
- **Penguncian Dependensi:** `environment.yaml` / `requirements.lock` yang mencantumkan hash sha256 dari seluruh package.

---

### 16. Standar Pelaporan Ilmiah & Format Tabel (Scientific Reporting)
Format tabel wajib berstandar CVPR/ICCV:
```markdown
| Metode | Backbone | mAP@[.50:.95] | AP50 | AP75 | AP_S | AP_M | AP_L | Params (M) | GFLOPs |
|---|---|---|---|---|---|---|---|---|---|
| Faster R-CNN | ResNet-50 | 37.4 ± 0.1 | 58.1 | 40.4 | 21.2 ± 0.2 | 41.0 | 48.1 | 41.5 | 180 |
| YOLOX-L | CSPDarknet | 50.1 ± 0.1 | 68.8 | 54.8 | 32.2 ± 0.2 | 55.4 | 63.8 | 54.2 | 155 |
| Deformable DETR (Baseline) | ResNet-50 | 43.8 ± 0.1 | 62.6 | 47.7 | 26.4 ± 0.2 | 47.1 | 58.0 | 39.8 | 173 |
| **Proposed Multi-Scale P2** | ResNet-50 | **45.2 ± 0.1** | **64.5** | **49.1** | **28.9 ± 0.2** | **48.3** | **58.6** | 41.2 | 192 |
```
*Catatan: Cetak tebal menunjukkan performa terbaik. Nilai dilaporkan dalam format $\mu \pm \sigma$ dihitung dari $N=3$ random seeds.*

---

### 17. Etika Penelitian & Dampak Sosial (Research Ethics)
- **Privasi Pengawasan Udara:** Evaluasi potensi pelanggaran privasi individu pada citra udara resolusi tinggi; implementasi algoritma pemburaman wajah dan plat nomor otomatis (*automatic anonymization*).
- **Bias Demografis & Geografis Dataset:** Mengakui bahwa dataset COCO didominasi oleh citra perkotaan negara Barat; memitigasi bias dengan menyertakan dataset konteks lokal Nusantara (pertanian tropis, pelabuhan selat Sumatera).
- **Dual-Use Technology Warning:** Penelitian deteksi objek memiliki implikasi ganda (sipil vs militer). Publikasi wajib membatasi klaim aplikasi pada domain sipil seperti tanggap bencana, monitoring lalu lintas, dan konservasi alam.

---

### 18. Daftar Periksa Kesiapan Publikasi (Publication-Readiness Checklist)
- [x] Hipotesis penelitian terdefinisi secara kuantitatif dan dapat difalsifikasi (*falsifiable*).
- [x] Baseline resmi telah direproduksi secara lokal dengan galat relatif $\le 0.5\%$.
- [x] Seluruh eksperimen stochastic dijalankan pada minimal $N \ge 3$ random seeds independen.
- [x] Dilaporkan nilai rata-rata, standar deviasi sampel, dan interval kepercayaan 95% bootstrap.
- [x] Tabel komparasi menyertakan parameter count (M), GFLOPs, dan latensi inferensi.
- [x] Analisis galat menggunakan taksonomi TIDE telah diintegrasikan.
- [x] Repositori kode, file konfigurasi YAML, dan bobot model siap diakses publik (*open science*).

