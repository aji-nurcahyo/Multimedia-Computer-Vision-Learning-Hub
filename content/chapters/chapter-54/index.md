# Bab 54 — Multimodal Embeddings & Retrieval

**Seksi Kurikulum:** Seksi 11 — Multimodal AI  
**Institusi:** Institut Teknologi Sumatera (ITERA)  
**Pengembang:** Aji Pamungkas Tri Nurcahyo  
**Lisensi Materi:** CC-BY-4.0 International Open Education License  

---

## 1. Pendahuluan & Gambaran Umum

Dalam era ledakan data digital, mesin pencari dan arsip multimedia dihadapkan pada tantangan mengekstrak dan menemukan kembali informasi visual dari miliaran citra dan video menggunakan kueri teks bahasa alami, atau sebaliknya menemukan deskripsi teks yang relevan dari sebuah cuplikan citra kueri (*Reverse Image Search*). Sistem pencarian klasik berbasis metadata teks manual (kata kunci tag) sangat terbatas karena biaya anotasi yang mahal dan ketidakmampuannya menangkap nuansa semantik visual yang kompleks.

**Multimodal Embeddings & Retrieval** adalah metodologi pemetaan konten lintas-modalitas (citra, video, audio, teks) ke dalam satu ruang metrik bersama (*joint metric embedding space*). Dalam ruang ini, jarak geometris antar-vektor berbanding lurus dengan kedekatan makna semantik (*semantic similarity*), terlepas dari modalitas asal sinyal tersebut.

Topik inti dalam bab ini mencakup:
1. **Topologi Ruang Metrik Bersama (*Joint Metric Embedding Space*)**: Mempelajari sifat geometris manifold berdimensi tinggi ($D = 512$ atau $768$) dan peran kritis normalisasi $\ell_2$.
2. **Pencarian Tetangga Terdekat (*Nearest Neighbor Search*)**: Membedakan pencarian eksak kNN brute-force $\mathcal{O}(N \cdot D)$ dengan algoritma pencarian tetangga terdekat hampiran (*Approximate Nearest Neighbors - ANN*) seperti HNSW (*Hierarchical Navigable Small World*) dan indeks berbasis kuantisasi vektor (FAISS / ScaNN).
3. **Pencarian Lintas-Modal Dwiarah (*Bidirectional Cross-Modal Retrieval*)**:
   - *Text-to-Image (T2I) Retrieval*: Kueri teks mengambil citra paling relevan.
   - *Image-to-Text (I2T) Retrieval*: Kueri citra mengambil deskripsi teks yang paling tepat.
4. **Metrik Evaluasi Sistem Retrieval**: Mengukur efektivitas pencarian secara formal melalui Recall@K ($R@1, R@5, R@10$), Mean Reciprocal Rank (MRR), dan Mean Average Precision (mAP) untuk retrieval, serta memperjelas perbedaannya dari mAP deteksi objek.

---

## 2. Landasan Matematis & Algoritma

### 2.1 Sifat Geometris & Kesetaraan Metrik Jarak

Diberikan dua vektor embedding semantik mentah $\mathbf{x}, \mathbf{y} \in \mathbb{R}^D$. Transformasi normalisasi $\ell_2$ memproyeksikan keduanya ke permukaan *unit hypersphere* $\mathbb{S}^{D-1}$:
$$\hat{\mathbf{u}} = \frac{\mathbf{x}}{\|\mathbf{x}\|_2}, \quad \hat{\mathbf{v}} = \frac{\mathbf{y}}{\|\mathbf{y}\|_2}$$

Terdapat kesetaraan analitis fundamental antara **Jarak Euclidean Kuadrat (*Squared Euclidean Distance*)** dan **Kesamaan Kosinus (*Cosine Similarity*)** pada vektor bernorma satu:
$$\|\hat{\mathbf{u}} - \hat{\mathbf{v}}\|_2^2 = (\hat{\mathbf{u}} - \hat{\mathbf{v}})^T (\hat{\mathbf{u}} - \hat{\mathbf{v}}) = \|\hat{\mathbf{u}}\|_2^2 + \|\hat{\mathbf{v}}\|_2^2 - 2 (\hat{\mathbf{u}} \cdot \hat{\mathbf{v}})$$
Karena $\|\hat{\mathbf{u}}\|_2 = \|\hat{\mathbf{v}}\|_2 = 1.0$:
$$\|\hat{\mathbf{u}} - \hat{\mathbf{v}}\|_2^2 = 1 + 1 - 2 \cos(\theta) = 2 (1 - \cos(\theta))$$

```
+-------------------------------------------------------------------------+
|                  TOPOLOGI RUANG METRIK BERSAMA                          |
+-------------------------------------------------------------------------+
                  Unit Hypersphere S^{D-1}
                          .  -  .
                      '           '
                   '    u_img        '    Jarak Euclidean d_E
                  (       *           )   <-------------------> * v_txt
                   '     / \         '     d_E^2 = 2(1 - cos theta)
                      '   |  theta  '
                          .  -  .
```

*Implikasi Komputasi*: Meminimalkan jarak Euclidean pada vektor ternormalisasi ekuivalen secara presisi dengan memaksimalkan kesamaan kosinus dot-product. Hal ini memungkinkan komputasi pencarian dilakukan menggunakan operasi perkalian matriks cepat $\mathbf{Q} \mathbf{X}^T$ (BLAS Level 3).

### 2.2 Metrik Evaluasi Sistem Retrieval Lintas-Modal

Untuk mengevaluasi performa sistem pencarian pada set pengujian berisi $N_q$ kueri:

#### 1. Recall@K (R@K)
Proporsi kueri di mana dokumen/citra yang benar berhasil ditemukan dalam $K$ peringkat teratas:
$$\text{Recall}@K = \frac{1}{N_q} \sum_{i=1}^{N_q} \mathbf{1}(\text{rank}_i \le K)$$
Di mana $\text{rank}_i$ adalah posisi peringkat item ground-truth pertama untuk kueri ke-$i$. Metrik standar industri yang biasa dilaporkan adalah $R@1$, $R@5$, dan $R@10$.

#### 2. Mean Reciprocal Rank (MRR)
Rata-rata dari kebalikan peringkat item relevan pertama:
$$\text{MRR} = \frac{1}{N_q} \sum_{i=1}^{N_q} \frac{1}{\text{rank}_i}$$
Jika item target selalu berada di peringkat 1, $\text{MRR} = 1.0$.

#### 3. Perbedaan Kritis: mAP Retrieval vs mAP Deteksi Objek
- **mAP Retrieval**: Menghitung rata-rata presisi terinterpolasi dari daftar dokumen/citra yang dikembalikan oleh kueri pencarian berdasarkan relevansi semantik:
  $$\text{AP}_q = \frac{1}{R_q} \sum_{k=1}^K P(k) \cdot \text{rel}(k), \quad \text{mAP} = \frac{1}{N_q} \sum_{q=1}^{N_q} \text{AP}_q$$
  Di mana $R_q$ adalah jumlah total dokumen relevan untuk kueri $q$.
- **mAP Deteksi Objek (Bab 42 & 50)**: Mengukur ketelitian lokalisasi spasial kotak pembatas 2D (*bounding boxes*) terhadap anotasi ground-truth berdasarkan tumpang tindih spasial $\text{IoU} \ge 0.50$ across kelas visual.

---

## 3. Contoh Perhitungan Numerik Langkah Demi Langkah

Mari kita selesaikan secara manual dan deterministik dua evaluasi fundamental: (1) pembuktian kesetaraan metrik jarak geometri, dan (2) evaluasi metrik retrieval komprehensif ($R@1, R@5, \text{MRR}$) pada 4 kueri uji.

---

### Bagian A: Pembuktian Analitis Hubungan Jarak Geometris

Diberikan dua vektor embedding 2D ternormalisasi:
$$\mathbf{u} = [1.0, 0.0]^T \quad (\|\mathbf{u}\| = 1.0), \quad \mathbf{v} = [0.6, 0.8]^T \quad (\|\mathbf{v}\| = \sqrt{0.36 + 0.64} = 1.0)$$

1. **Hitung Kesamaan Kosinus**:
   $$\cos(\theta) = \mathbf{u} \cdot \mathbf{v} = (1.0 \times 0.6) + (0.0 \times 0.8) = 0.6000$$

2. **Hitung Jarak Euclidean Kuadrat ($d_E^2$)**:
   $$\Delta x = 1.0 - 0.6 = 0.40, \quad \Delta y = 0.0 - 0.8 = -0.80$$
   $$d_E^2 = (\Delta x)^2 + (\Delta y)^2 = (0.40)^2 + (-0.80)^2 = 0.1600 + 0.6400 = 0.8000$$
   $$d_E = \sqrt{0.8000} \approx 0.894427$$

3. **Verifikasi Hubungan Teoretis $d_E^2 = 2(1 - \cos\theta)$**:
   $$2(1 - \cos\theta) = 2(1.0 - 0.6000) = 2(0.4000) = 0.8000$$
   $$d_E^2 \equiv 2(1 - \cos\theta) = 0.8000 \quad (\text{Terbukti Identik Eksak})$$

---

### Bagian B: Evaluasi Sistem Retrieval Lintas-Modal ($N_q = 4$ Kueri)

Sebuah sistem pencarian teks-ke-citra diuji menggunakan 4 kueri teks independen terhadap database arsip visual. Peringkat kemunculan citra ground-truth target tercatat sebagai berikut:
- **Kueri 1** (`"mobil sedan merah di jalan raya"`): Citra target ditemukan pada **Peringkat 1** ($\text{rank}_1 = 1$).
- **Kueri 2** (`"anjing golden retriever melompat"`): Citra target ditemukan pada **Peringkat 3** ($\text{rank}_2 = 3$).
- **Kueri 3** (`"pesawat komersial lepas landas"`): Citra target ditemukan pada **Peringkat 2** ($\text{rank}_3 = 2$).
- **Kueri 4** (`"kapal kargo bersandar di dermaga"`): Citra target ditemukan pada **Peringkat 6** ($\text{rank}_4 = 6$).

---

#### Langkah 1: Hitung Recall@1
Item target berada pada peringkat $\le 1$:
- Kueri 1: $\text{rank}_1 = 1 \le 1 \implies \mathbf{1} = 1$
- Kueri 2: $\text{rank}_2 = 3 > 1 \implies \mathbf{1} = 0$
- Kueri 3: $\text{rank}_3 = 2 > 1 \implies \mathbf{1} = 0$
- Kueri 4: $\text{rank}_4 = 6 > 1 \implies \mathbf{1} = 0$

$$\text{Recall}@1 = \frac{1 + 0 + 0 + 0}{4} = \frac{1}{4} = 0.2500 \quad (25.0\%)$$

---

#### Langkah 2: Hitung Recall@5
Item target berada pada peringkat $\le 5$:
- Kueri 1: $\text{rank}_1 = 1 \le 5 \implies \mathbf{1} = 1$
- Kueri 2: $\text{rank}_2 = 3 \le 5 \implies \mathbf{1} = 1$
- Kueri 3: $\text{rank}_3 = 2 \le 5 \implies \mathbf{1} = 1$
- Kueri 4: $\text{rank}_4 = 6 > 5 \implies \mathbf{1} = 0$

$$\text{Recall}@5 = \frac{1 + 1 + 1 + 0}{4} = \frac{3}{4} = 0.7500 \quad (75.0\%)$$

---

#### Langkah 3: Hitung Mean Reciprocal Rank (MRR)
Hitung nilai kebalikan peringkat untuk tiap kueri:
- Kueri 1: $\frac{1}{\text{rank}_1} = \frac{1}{1} = 1.0000$
- Kueri 2: $\frac{1}{\text{rank}_2} = \frac{1}{3} \approx 0.333333$
- Kueri 3: $\frac{1}{\text{rank}_3} = \frac{1}{2} = 0.5000$
- Kueri 4: $\frac{1}{\text{rank}_4} = \frac{1}{6} \approx 0.166667$

Rata-rata kebalikan peringkat:
$$\text{MRR} = \frac{1.0000 + 0.333333 + 0.5000 + 0.166667}{4} = \frac{2.0000}{4} = 0.5000$$

*Interpretasi Hasil*: Sistem menghasilkan tingkat keberhasilan peringkat pertama sebesar $25\%$, namun berhasil mencakup $75\%$ item target di dalam jendela 5 rekomendasi teratas dengan skor kualitas urutan $\text{MRR} = 0.5000$.

---

## 4. Analisis Mode Kegagalan & Penanganannya

1. **Kesenjangan Geometris Modalitas (*Modality Gap Phenomenon*)**:
   - *Penyebab*: Meskipun model dual-encoder dilatih dengan loss simetris, Liang et al. (2022) membuktikan bahwa embedding citra dan embedding teks berkumpul di dua klaster kerucut (*cones*) terpisah yang tidak saling tumpang tindih secara sempurna.
   - *Solusi Teknik*: Lakukan pemusatan vektor (*Mean Centering / Decoupled Centering*): kurangkan vektor rata-rata tiap modalitas sebelum normalisasi $\ell_2$.

2. **Masalah Hubness pada Ruang Dimensi Tinggi (*The Hubness Problem*)**:
   - *Penyebab*: Fenomena kelengkungan ruang dimensi tinggi di mana beberapa titik data tertentu secara geometris menjadi tetangga terdekat bagi sebagian besar kueri acak (*hub points*), merusak keberagaman hasil retrieval.
   - *Solusi Teknik*: Terapkan normalisasi timbal balik (*Cross-Domain Inverted Softmax - CSLS*) atau penskalaan kuantil jarak tetangga terdekat.

3. **Ambiguitas Polisemi Bahasa (*Polysemy Ambiguity*)**:
   - *Penyebab*: Kueri kata tunggal yang ambigu (misalnya `"apple"` dapat merujuk pada buah apel atau perusahaan teknologi) menghasilkan vektor yang berada di antara kedua konsep visual.
   - *Solusi Teknik*: Terapkan teknik *Query Expansion* berbasis konteks kalimat atau sediakan mekanisme *Relevance Feedback* interaktif.

---

## 5. Eksperimen Terpandu & Dokumentasi Praktikum

### 5.1 Tiga Moda Pembelajaran Platform
- **Mode A (Eksplorasi Web Interaktif)**: Komponen laboratorium `CrossModalSearchLab.tsx` menyediakan pencarian semantik teks-ke-citra interaktif, visualisasi proyeksi ruang embedding 2D (t-SNE/PCA), dan tabel perankingan Top-K dengan skor kesamaan kosinus langsung di browser.
- **Mode B (Verifikasi Algoritmik Mandiri)**: Skrip Python lokal `examples/example-01.py` memvalidasi identitas geometris $d_E^2 = 2(1 - \cos\theta)$, perhitungan $R@1, R@5$, dan $\text{MRR} = 0.5000$ secara deterministik menggunakan NumPy murni.
- **Mode C (Notebook Komputasi & Model Pretrained)**: Berkas `notebooks/chapter-54-lab.ipynb` memuat demonstrasi pengindeksan vektor pencarian menggunakan pustaka kNN/FAISS dan ekstraksi embedding teks/citra.

### 5.2 Panduan Eksekusi Notebook (`chapter-54-lab.ipynb`)
1. Buka antarmuka Jupyter Notebook lokal atau unggah ke [Google Colab](https://colab.research.google.com/).
2. Eksekusi sel berurutan. Sel 2 menginisialisasi pustaka komputasi numerik.
3. Sel 3 memvalidasi hubungan geometris metrik jarak dan menghitung metrik evaluasi retrieval Seksi 3 secara deterministik.
4. Sel 4 mengevaluasi fenomena Modality Gap dan dampak normalisasi mean-centering terhadap akurasi Top-K.
5. Sel 5 menyediakan panduan implementasi indeks pencarian vektor berskala besar menggunakan indeks HNSW / FAISS di GPU.

### 5.3 Struktur Masukan, Pemrosesan, & Keluaran Eksperimen
- **Input Data**: Himpunan vektor embedding kueri $\mathbf{Q} \in \mathbb{R}^{N_q \times D}$, basis data embedding dokumen $\mathbf{D} \in \mathbb{R}^{M \times D}$, dan label pasangan acuan.
- **Transformasi**:
  1. Normalisasi $\ell_2$ pada kueri dan basis data.
  2. Komputasi matriks kesamaan kosinus $\mathbf{S} = \mathbf{Q} \mathbf{D}^T$.
  3. Pengurutan indeks menurun (*argsorting descending*).
  4. Akumulasi posisi peringkat target untuk komputasi $R@K$ dan MRR.
- **Output & Evaluasi**: Tabel daftar peringkat teratas, skor Recall@K, skor MRR, dan visualisasi distribusi jarak.

---

## 6. Diagram Arsitektur Sistem

![Topologi Ruang Metrik Bersama (Joint Metric Embedding Space)](/media/diagrams/chapter-54-crossmodal-embedding-space.svg)

![Metrik Evaluasi Sistem Retrieval Lintas-Modal: Recall@K, Precision@K & MRR](/media/diagrams/chapter-54-semantic-retrieval-evaluation-metrics.svg)

---

## 7. Rangkuman & Pembahasan Akademik
Pencarian multimedia berbasis ruang embedding bersama mendemokratisasi akses ke gudang informasi visual raksasa. Dengan memahami ekuivalensi antara kesamaan kosinus dan jarak Euclidean pada unit hypersphere, sistem retrieval dapat dirancang dengan efisiensi komputasi optimal. Melalui evaluasi kuantitatif yang ketat menggunakan Recall@K dan MRR serta mitigasi kesenjangan modalitas (*Modality Gap*), para perekayasa kecerdasan visual dapat membangun mesin pencari lintas-modal yang akurat, cepat, dan terpercaya.
