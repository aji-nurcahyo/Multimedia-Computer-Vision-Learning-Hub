# Chapter 44 — Object Detection with YOLO

## 1. Konsep & Motivasi Akademik
Deteksi objek (*object detection*) memperluas domain klasifikasi citra sederhana dengan tidak hanya menjawab pertanyaan "objek apa yang ada dalam citra?" (*what*), tetapi juga melokalisasi secara presisi "di mana posisi objek tersebut berada?" (*where*). Lokalisasi dinyatakan dalam bentuk kotak pembatas (*bounding box*) bersumbu tegak $\mathbf{b} = [x, y, w, h]$ beserta skor keyakinan probabilitas kelas $P(\text{Class}_c)$.

Dalam sejarah visi komputer berbasis deep learning, terdapat dua paradigma utama arsitektur detektor objek:
1. **Two-Stage Detectors (Keluarga R-CNN)**:
   - Pelopor: R-CNN (Girshick et al., 2014), Fast R-CNN (2015), dan Faster R-CNN (Ren et al., 2015).
   - Mekanisme: Tahap pertama membangkitkan proposal wilayah kandidat objek (*Region Proposal Network - RPN*), kemudian tahap kedua melakukan pooling fitur (RoIPool / RoIAlign) dan klasifikasi serta regresi kotak per proposal secara terpisah.
   - Karakteristik: Akurasi lokalisasi sangat tinggi namun latensi komputasi lambat (5–15 FPS), tidak cocok untuk skenario *real-time edge computing*.
2. **One-Stage Detectors (Keluarga YOLO & SSD)**:
   - Pelopor: YOLO (Redmon et al., 2016), SSD (Liu et al., 2016), RetinaNet (Lin et al., 2017), YOLOv3–v8.
   - Mekanisme: Membingkai deteksi objek sebagai **masalah regresi spasial tunggal end-to-end** dari piksel citra langsung menuju koordinat bounding box dan probabilitas kelas dalam satu lintasan forward (*single forward pass*).
   - Karakteristik: Kecepatan inferensi luar biasa tinggi (30–120+ FPS) dengan akurasi yang kini bersaing ketat atau melampaui detektor dua tahap.

```
+-------------------------------------------------------------------------+
| Evolusi Paradigma Deteksi Objek                                         |
|                                                                         |
| Two-Stage: [Citra] -> [RPN (Proposal)] -> [RoIAlign] -> [Head R-CNN]    |
|             (Akurat, Kompleks, 10 FPS)                                  |
|                                                                         |
| One-Stage: [Citra] -> [DarkNet / CSPDarkNet Backbone] -> [FPN / PAN]    |
|                    -> [Decoupled Detection Head] (Real-Time, 60+ FPS)   |
+-------------------------------------------------------------------------+
```

## 2. Formulasi Matematika & Landasan Teori

### 2.1 Dekode Kotak Pembatas: Anchor-Based vs Anchor-Free
Pada arsitektur klasik YOLOv2–YOLOv5, prediksi bounding box berbasis jangkar (*anchor boxes*). Citra dibagi menjadi grid sel $S \times S$. Untuk setiap sel grid $(c_x, c_y)$ dan anchor dengan dimensi lebar $p_w$ dan tinggi $p_h$, model memprediksi 4 nilai regresi kontinu $(t_x, t_y, t_w, t_h)$:

$$b_x = \sigma(t_x) + c_x, \quad b_y = \sigma(t_y) + c_y$$
$$b_w = p_w e^{t_w}, \quad b_h = p_h e^{t_h}$$

di mana $\sigma(\cdot)$ adalah fungsi sigmoid yang membatasi titik pusat kotak $(b_x, b_y)$ agar selalu berada di dalam batas sel grid lokal tersebut.

Pada model modern (YOLOv8, FCOS), pendekatan beralih ke **Anchor-Free** dengan representasi jarak ke batas kotak (*Distribution Focal Loss - DFL*). Untuk titik acuan $(c_x, c_y)$ pada tingkat skala tertentu, model langsung meregresikan jarak ke 4 sisi: $(l, t, r, b)$ (kiri, atas, kanan, bawah):

$$x_1 = c_x - l, \quad y_1 = c_y - t, \quad x_2 = c_x + r, \quad y_2 = c_y + b$$

### 2.2 Metrik Bounding Box Regression Loss: Dari MSE Menuju CIoU
Regresi koordinat kotak menggunakan Mean Squared Error (MSE) tidak memperhitungkan korelasi spasial antara $(x, y)$ dan $(w, h)$, serta sangat sensitif terhadap skala absolut kotak. Oleh karena itu, detektor modern menggunakan metrik berbasis IoU yang invarian skala:

1. **Intersection over Union (IoU)**:
   $$\text{IoU} = \frac{|\mathcal{B} \cap \mathcal{B}^{\text{gt}}|}{|\mathcal{B} \cup \mathcal{B}^{\text{gt}}|}$$
   Kelemahan: Jika kotak prediksi dan ground truth tidak beririsan ($|\mathcal{B} \cap \mathcal{B}^{\text{gt}}| = 0$), maka $\text{IoU} = 0$ dan gradiennya nol (hilang), sehingga kotak tidak dapat ditarik mendekat.

2. **Complete IoU (CIoU) Loss** (Zheng et al., 2020):
   CIoU memperhitungkan tiga faktor geometri kritis secara simultan: area tumpang tindih (*overlap area*), jarak titik pusat (*central point distance*), dan konsistensi rasio aspek (*aspect ratio consistency*):

   $$\mathcal{L}_{\text{CIoU}} = 1 - \text{IoU} + \frac{\rho^2(\mathbf{b}, \mathbf{b}^{\text{gt}})}{c^2} + \alpha v$$

   di mana:
   - $\rho(\mathbf{b}, \mathbf{b}^{\text{gt}})$ adalah jarak Euclidean antara titik pusat kotak prediksi dan kotak ground truth: $\sqrt{(b_x - b_x^{\text{gt}})^2 + (b_y - b_y^{\text{gt}})^2}$.
   - $c$ adalah panjang diagonal kotak pembatas terkecil (*smallest enclosing bounding box*) yang melingkupi kedua kotak.
   - $v$ mengukur konsistensi rasio aspek:
     $$v = \frac{4}{\pi^2} \left( \arctan\frac{w^{\text{gt}}}{h^{\text{gt}}} - \arctan\frac{w}{h} \right)^2$$
   - $\alpha$ adalah parameter penimbang trade-off:
     $$\alpha = \frac{v}{(1 - \text{IoU}) + v}$$

### 2.3 Post-Processing: Non-Maximum Suppression (NMS)
Satu objek sering kali memicu puluhan deteksi kotak tumpang tindih dari sel-sel grid bertetangga. NMS mengeliminasi redundansi ini:
1. Urutkan seluruh kotak prediksi kandidat berdasarkan skor kepercayaan $s_i = P(\text{Object}) \cdot P(\text{Class}_c \mid \text{Object})$ secara menurun.
2. Ambil kotak dengan skor tertinggi $\mathcal{B}_{\max}$, masukkan ke daftar deteksi final $\mathcal{D}$.
3. Hapus seluruh kotak tersisa $\mathcal{B}_j$ yang memiliki $\text{IoU}(\mathcal{B}_{\max}, \mathcal{B}_j) \ge \tau_{\text{nms}}$ (ambang batas umum $\tau_{\text{nms}} = 0.45 - 0.65$).
4. Ulangi proses hingga daftar kandidat kosong.

### 2.4 Protokol Evaluasi: mAP (Mean Average Precision)
Metrik resmi evaluasi deteksi objek (PASCAL VOC dan MS COCO) adalah **mAP**:
- Untuk setiap kelas $c$, urutkan deteksi berdasarkan confidence score, hitung pasangan nilai Precision dan Recall pada setiap ambang batas, membentuk kurva Precision-Recall $p(r)$.
- **Average Precision (AP)**: Luas area di bawah kurva PR (*Area Under Curve - AUC*), dihitung melalui interpolasi numerik (101 titik pada COCO):
  $$\text{AP} = \int_0^1 p(r) \, dr \approx \frac{1}{101} \sum_{r \in \{0, 0.01, \dots, 1.0\}} \max_{\tilde{r} \ge r} p(\tilde{r})$$
- **mAP@[0.5:0.95]**: Rata-rata AP di seluruh 80 kelas COCO pada 10 ambang batas IoU mulai dari $0.50$ hingga $0.95$ dengan kenaikan $0.05$.

---

## 3. Contoh Perhitungan Manual Terpandu

Mari kita hitung secara analitik metrik **CIoU Loss** antara kotak prediksi $\mathcal{B}$ dan ground truth $\mathcal{B}^{\text{gt}}$:

### Data Koordinat:
- Kotak Ground Truth $\mathcal{B}^{\text{gt}}$: $[x_1, y_1, x_2, y_2] = [20, 20, 100, 100]$
  - Pusat: $b_x^{\text{gt}} = 60, b_y^{\text{gt}} = 60$
  - Dimensi: $w^{\text{gt}} = 80, h^{\text{gt}} = 80$
  - Area: $A^{\text{gt}} = 80 \times 80 = 6400$
- Kotak Prediksi $\mathcal{B}$: $[x_1, y_1, x_2, y_2] = [40, 40, 120, 120]$
  - Pusat: $b_x = 80, b_y = 80$
  - Dimensi: $w = 80, h = 80$
  - Area: $A = 80 \times 80 = 6400$

### Langkah 1: Hitung Luas Irisan & IoU
- Koordinat irisan:
  - $x_1^{\text{inter}} = \max(20, 40) = 40$
  - $y_1^{\text{inter}} = \max(20, 40) = 40$
  - $x_2^{\text{inter}} = \min(100, 120) = 100$
  - $y_2^{\text{inter}} = \min(100, 120) = 100$
  - Lebar irisan = $100 - 40 = 60$, Tinggi irisan = $100 - 40 = 60$
  - $A_{\text{inter}} = 60 \times 60 = 3600$
- Luas gabungan (*Union*):
  - $A_{\text{union}} = A^{\text{gt}} + A - A_{\text{inter}} = 6400 + 6400 - 3600 = 9200$
- $\text{IoU} = \frac{3600}{9200} = \frac{9}{23} \approx 0.3913$

### Langkah 2: Hitung Jarak Titik Pusat $\rho^2$
- Selisih pusat: $\Delta x = 80 - 60 = 20, \Delta y = 80 - 60 = 20$
- $\rho^2 = 20^2 + 20^2 = 400 + 400 = 800$

### Langkah 3: Hitung Diagonal Kotak Pembatas Terkecil $c^2$
- Kotak pelingkup terkecil melingkupi $[20, 20]$ hingga $[120, 120]$:
  - Lebar pelingkup $W_c = 120 - 20 = 100$
  - Tinggi pelingkup $H_c = 120 - 20 = 100$
  - $c^2 = W_c^2 + H_c^2 = 100^2 + 100^2 = 10000 + 10000 = 20000$
- Rasio penalti jarak:
  $$\frac{\rho^2}{c^2} = \frac{800}{20000} = 0.0400$$

### Langkah 4: Hitung Konsistensi Rasio Aspek $v$ dan $\alpha$
- Rasio aspek ground truth: $\frac{w^{\text{gt}}}{h^{\text{gt}}} = \frac{80}{80} = 1.0 \implies \arctan(1.0) = \frac{\pi}{4}$
- Rasio aspek prediksi: $\frac{w}{h} = \frac{80}{80} = 1.0 \implies \arctan(1.0) = \frac{\pi}{4}$
- Karena kedua rasio aspek identik:
  $$v = \frac{4}{\pi^2} \left( \frac{\pi}{4} - \frac{\pi}{4} \right)^2 = 0 \implies \alpha v = 0$$

### Langkah 5: Hitung CIoU Loss Akhir
$$\mathcal{L}_{\text{CIoU}} = 1 - \text{IoU} + \frac{\rho^2}{c^2} + \alpha v$$
$$\mathcal{L}_{\text{CIoU}} = 1 - 0.3913 + 0.0400 + 0 = 0.6487$$

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Deteksi Objek Berukuran Sangat Kecil (Small Objects)**:
   - *Penyebab*: Downsampling agresif pada backbone (stride 32) menyebabkan fitur objek berukuran $< 16 \times 16$ piksel tereduksi menjadi pecahan aktivasi sub-piksel tunggal pada output feature map.
   - *Solusi Teknik*: Gunakan arsitektur piramida fitur multi-skala (Feature Pyramid Network - FPN / PANet), tambahkan head prediksi resolusi tinggi dengan stride 4 atau 8, dan gunakan resolusi input lebih tinggi ($640 \to 1280$).

2. **Oklusi Padat & Objek Bertumpuk (Dense Occlusion)**:
   - *Penyebab*: NMS standar menggunakan ambang batas IoU tetap. Pada kerumunan manusia (crowd detection), kotak pembatas dua individu berbeda yang berdiri berdekatan dapat memiliki IoU $> 0.5$, menyebabkan salah satu orang tereliminasi secara keliru (False Negative).
   - *Solusi Teknik*: Gunakan **Soft-NMS** (Bodla et al., 2017) yang menurunkan skor confidence kotak bertahap daripada langsung menghapusnya, atau terapkan DETR (DEtection TRansformer) berbasis bipartite matching bebas NMS.

3. **False Positive pada Latar Belakang Kompleks**:
   - *Penyebab*: Rasio sel grid latar belakang murni (background) jauh mendominasi sel yang berisi objek (>1000:1).
   - *Solusi Teknik*: Terapkan Task-Aligned Assigner untuk memilih pasangan sampel positif-negatif berkualitas tinggi dan gunakan Focal Loss untuk menekan gradien sampel negatif mudah (*easy negatives*).

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Mode Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `YoloObjectDetectionLab.tsx` menyediakan demonstrasi penyaringan duplikasi prediksi kandidat bounding box menggunakan algoritma NMS real-time dengan pengatur slider confidence threshold dan IoU threshold.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memverifikasi secara deterministik perhitungan metrik Complete IoU (CIoU) Loss, penyaringan NMS, dan 11-point Average Precision (AP).
- **Mode C (Notebook Komputasi & Model YOLOv8)**: Berkas `notebooks/chapter-44-lab.ipynb` mengintegrasikan pipeline deteksi objek nyata menggunakan Ultralytics YOLOv8n (Nano, ~3.2M parameter).

### 5.2 Panduan Eksekusi Notebook (`chapter-44-lab.ipynb`)
1. Buka Jupyter atau unggah notebook ke [Google Colab](https://colab.research.google.com/).
2. Pasang pustaka deteksi jika belum ada:
   ```bash
   !pip install -q ultralytics opencv-python matplotlib
   ```
3. Eksekusi sel berurutan. Sel 6 akan memuat bobot resmi `YOLO('yolov8n.pt')` (lisensi copyleft AGPL-3.0) dan menjalankan inferensi langsung pada citra dengan pencatatan latensi (*latency tracking*).
4. Jika dijalankan di lingkungan lokal CPU tanpa pustaka Ultralytics, notebook secara elegan mengeksekusi perhitungan analitis CIoU dan memvalidasi pengurutan NMS tanpa hambatan error.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Citra digital RGB (resolusi standar inferensi $640 \times 640$ piksel).
- **Proses Transformasi**:
  1. Input Preprocessing: Penskalaan aspek rasio dengan letterboxing (padding warna abu-abu 114) dan normalisasi piksel $[0, 1]$.
  2. Backbone & Neck: CSPDarknet dan PANet mengekstrak fitur pada 3 tingkat skala spasial ($P_3/8$, $P_4/16$, $P_5/32$).
  3. Anchor-Free Head: Menghasilkan prediksi koordinat box kontinu dan probabilitas 80 kelas MS COCO.
  4. Non-Maximum Suppression (NMS): Menyaring ribuan kandidat kotak tumpang tindih menjadi kotak deteksi final.
- **Output & Evaluasi**:
  - Koordinat Bounding Box $[x_1, y_1, x_2, y_2]$, label kelas terprediksi (misal: "Car 0.92", "Person 0.88"), dan latensi inferensi (~12 ms pada GPU, ~45 ms pada CPU).

### 5.4 Masalah Umum & Troubleshooting Mahasiswa
- **Bounding Box Terlalu Padat/Duplikat**: Nilai NMS IoU threshold disetel terlalu tinggi ($\tau_{\text{nms}} > 0.7$). Turunkan nilai threshold ke $0.45 - 0.50$ agar kotak beririsan tinggi ditekan.
- **Deteksi Objek Hilang (False Negative)**: Nilai confidence threshold disetel terlalu konservatif ($conf > 0.8$). Turunkan threshold ke $0.25 - 0.35$ untuk menampilkan objek yang berukuran lebih kecil atau tersamarkan.

---

## 6. Diagram Arsitektur Sistem

![Arsitektur Grid & Anchor Box Deteksi Objek YOLO](/media/diagrams/chapter-44-yolo-grid-and-anchor-boxes.svg)

![Intersection-over-Union (IoU) & Non-Maximum Suppression (NMS)](/media/diagrams/chapter-44-iou-and-non-max-suppression.svg)

---

## 7. Rangkuman & Pembahasan Akademik
YOLO merevolusi bidang deteksi objek modern dengan mengubah persoalan pencarian proposal wilayah yang lambat menjadi tugas regresi spasial tunggal berkecepatan tinggi. Kunci kematangan teknologi YOLO terletak pada evolusi fungsi kerugian geometri (dari L1/L2 ke CIoU/DFL), integrasi Feature Pyramid Network (PANet) untuk menangani variasi skala objek yang ekstrem, serta desain decoupled head yang memisahkan klasifikasi dari regresi koordinat. Pemahaman mendalam terhadap trade-off kecepatan versus presisi pada metrik mAP@[0.5:0.95] adalah prasyarat penting dalam merancang sistem penglihatan otonom dan pengawasan cerdas.
