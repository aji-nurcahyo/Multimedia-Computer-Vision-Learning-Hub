# Chapter 07 — Color Models & Color Space Transformation

> **Bagian Kurikulum**: Section 02 — Digital Image Processing Fundamentals  
> **Estimasi Durasi**: 120 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Chapter 06 (Digital Image Fundamentals)  
> **Learning Tracks**: Digital Image Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Warna merupakan salah satu deskriptor visual paling kuat yang membantu manusia dan sistem visi komputer mengenali objek, mendeteksi kematangan buah, melacak objek berbasis warna, maupun melakukan kalibrasi pencahayaan. Namun, model warna **RGB (*Red, Green, Blue*)** yang secara alami digunakan oleh sensor kamera dan layar monitor memiliki kelemahan kritis: ketiga komponen warna berkorelasi erat dengan intensitas pencahayaan (*illumination*). Apabila pencahayaan berubah (bayangan atau silau cahaya), nilai R, G, dan B berubah serentak sehingga menyulitkan segmentasi berbasis warna.

Dalam bab ini, kita membedah ruang warna **RGB**, **Grayscale**, **HSV (*Hue, Saturation, Value*)**, **HSL (*Hue, Saturation, Lightness*)**, **YCbCr**, dan **CIELAB ($L^*a^*b^*$)**—memahami transformasi matematis antar ruang warna, interpretasi setiap saluran (*channel*), serta penerapannya dalam segmentasi warna yang tangguh terhadap variasi pencahayaan.

---

## 2. Learning Objectives

1. **Menjelaskan** konsep model warna aditif (*RGB*) berorientasi perangkat keras vs model perseptual (*HSV*, *HSL*, *CIELAB*) dan penyiaran video (*YCbCr*).
2. **Menghitung** transformasi matematis konversi dari ruang RGB ternormalisasi menuju HSV, YCbCr (BT.601), dan CIELAB (D65).
3. **Menganalisis** alasan mengapa ruang HSV dan CIELAB jauh lebih efektif untuk segmentasi objek berwarna dibanding RGB murni.
4. **Mengimplementasikan** pipeline segmentasi berbasis rentang warna (`cv2.inRange`) pada OpenCV serta memahami skala khusus OpenCV 8-bit (`H ∈ [0, 179]`).
5. **Mengevaluasi** sensitivitas ruang warna terhadap perubahan kondisi pencahayaan dan bayangan (*shadow robustness*).

---

## 3. Prerequisites

- Struktur citra RGB 3 saluran dan konversi dasar Grayscale BT.601 [Chapter 06].
- Pengindeksan array 3 dimensi dengan NumPy dan operasi pemotongan saluran [Chapter 05].

---

## 4. Fundamental Concepts

### 4.1 Model Warna Berorientasi Perangkat Keras: RGB & Grayscale

![Model Warna RGB vs HSV](/media/diagrams/chapter-07-color-spaces.svg)
*Gambar 7.1 — Perbandingan sintesis aditif RGB dengan model silinder perseptual HSV yang memisahkan rona warna dari kecerahan.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **RGB**: Setiap warna dibentuk oleh kombinasi aditif cahaya Merah, Hijau, dan Biru dalam kubus satuan $[0, 1]^3$ atau $[0, 255]^3$. Sangat cocok untuk tampilan layar LED dan akuisisi sensor Bayer, tetapi kurang intuitif bagi manusia untuk mendeskripsikan "merah pudar" atau "biru gelap".
- **Grayscale**: Merepresentasikan intensitas luminansi tunggal (akromatik) tanpa informasi rona warna.

### 4.2 Ruang Warna Perseptual: HSV & HSL

HSV dan HSL memisahkan informasi **rona warna murni** (*Hue*) dari informasi **kepekatan warna** (*Saturation*) dan **kecerahan/pencahayaan** (*Value / Lightness*):
- **Hue ($H \in [0^\circ, 360^\circ)$)**: Mengkodekan sudut spektrum warna ($0^\circ$ Merah, $60^\circ$ Kuning, $120^\circ$ Hijau, $180^\circ$ Sian, $240^\circ$ Biru, $300^\circ$ Magenta).
- **Saturation ($S \in [0, 1]$)**: Tingkat kemurnian warna terhadap warna putih/abu-abu ($S = 0$ adalah akromatik).
- **Value ($V$) vs Lightness ($L$)**: Pada HSV, warna murni paling terang berada pada $V = 1, S = 1$. Pada HSL, warna murni berada pada $L = 0.5, S = 1$, sedangkan $L = 1$ selalu bernilai putih murni.

### 4.3 Ruang Warna Video & Perseptual Metrik: YCbCr & CIELAB

![Dekomposisi YCbCr dan CIELAB](/media/diagrams/chapter-07-hsv-ycbcr-lab.svg)
*Gambar 7.2 — Struktur dekomposisi kanal luma-kroma pada YCbCr dan sumbu keseragaman perseptual CIELAB.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

- **YCbCr**: Digunakan dalam kompresi JPEG, MPEG, H.264, dan siaran televisi. Kanal $Y$ menyimpan kecerahan (*luma*), sementara $Cb$ (selisih biru) dan $Cr$ (selisih merah) menyimpan krominansi. Pemisahan ini memungkinkan **chroma subsampling (4:2:0)** tanpa penurunan tajam yang dirasakan mata manusia.
- **CIELAB ($L^*a^*b^*$)**: Dirancang oleh CIE agar jarak Euclidean $\Delta E = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$ antara dua titik warna mencerminkan perbedaan persepsi mata manusia secara seragam (*perceptually uniform*), sangat ideal untuk aplikasi pencocokan warna dan deteksi kulit/tanaman.

---

## 5. Mathematical Foundations

### 5.1 Konversi RGB $\rightarrow$ HSV

Misalkan $R' = R/255, G' = G/255, B' = B/255$, dengan $C_{\max} = \max(R', G', B')$, $C_{\min} = \min(R', G', B')$, dan $\Delta = C_{\max} - C_{\min}$:

$$H = \begin{cases} 0^\circ & \text{jika } \Delta = 0 \\ 60^\circ \times \left( \frac{G' - B'}{\Delta} \bmod 6 \right) & \text{jika } C_{\max} = R' \\ 60^\circ \times \left( \frac{B' - R'}{\Delta} + 2 \right) & \text{jika } C_{\max} = G' \\ 60^\circ \times \left( \frac{R' - G'}{\Delta} + 4 \right) & \text{jika } C_{\max} = B' \end{cases}$$

$$S = \begin{cases} 0 & \text{jika } C_{\max} = 0 \\ \frac{\Delta}{C_{\max}} & \text{jika } C_{\max} \neq 0 \end{cases}, \qquad V = C_{\max}$$

### 5.2 Konversi RGB $\rightarrow$ YCbCr (Full Range BT.601)

$$\begin{bmatrix} Y \\ C_b \\ C_r \end{bmatrix} = \begin{bmatrix} 0 \\ 128 \\ 128 \end{bmatrix} + \begin{bmatrix} 0.299 & 0.587 & 0.114 \\ -0.168736 & -0.331264 & 0.500 \\ 0.500 & -0.418688 & -0.081312 \end{bmatrix} \begin{bmatrix} R \\ G \\ B \end{bmatrix}$$

### 5.3 Konversi sRGB $\rightarrow$ XYZ (D65) $\rightarrow$ CIELAB

Komponen sRGB terlebih dahulu dilinearisasi terhadap gamma standar $2.4$, lalu diproyeksikan ke ruang tristimulus CIE XYZ (titik putih D65: $X_n = 0.95047, Y_n = 1.00000, Z_n = 1.08883$):

$$L^* = 116 f(Y/Y_n) - 16, \quad a^* = 500\,[f(X/X_n) - f(Y/Y_n)], \quad b^* = 200\,[f(Y/Y_n) - f(Z/Z_n)]$$

di mana fungsi non-linier $f(t) = t^{1/3}$ untuk $t > 0.008856$, dan $f(t) = 7.787 t + 16/116$ untuk nilai kecil lainnya.

---

## 6. Worked Numerical Example

**Soal**: Diberikan piksel berwarna biru kehijauan (*teal*) dengan nilai $R = 51, G = 153, B = 204$. Hitung nilai $(H, S, V)$ dan $(Y, C_b, C_r)$!

**Penyelesaian**:
1. **Normalisasi RGB**:
   $$R' = \frac{51}{255} = 0.2, \quad G' = \frac{153}{255} = 0.6, \quad B' = \frac{204}{255} = 0.8$$
   $$C_{\max} = 0.8 \text{ (pada saluran Biru)}, \quad C_{\min} = 0.2, \quad \Delta = 0.8 - 0.2 = 0.6$$
2. **Hitung HSV**:
   - $H = 60^\circ \times \left(\frac{0.2 - 0.6}{0.6} + 4\right) = 60^\circ \times (-0.6667 + 4) = 60^\circ \times 3.3333 = \mathbf{200^\circ}$ (Biru-Sian).
   - $S = \frac{0.6}{0.8} = \mathbf{0.75}$ ($75\%$).
   - $V = \mathbf{0.80}$ ($80\%$).
   *(Pada konvensi 8-bit OpenCV: $H_{\text{cv}} = 200/2 = 100$, $S_{\text{cv}} = 0.75 \times 255 = 191$, $V_{\text{cv}} = 0.80 \times 255 = 204$).*
3. **Hitung YCbCr**:
   - $Y = 0.299(51) + 0.587(153) + 0.114(204) = 15.25 + 89.81 + 23.26 = \mathbf{128.32 \approx 128}$.
   - $C_b = 128 - 0.1687(51) - 0.3313(153) + 0.5(204) = 128 - 8.60 - 50.69 + 102 = \mathbf{170.71 \approx 171}$ ($> 128$ menandakan dominan biru).
   - $C_r = 128 + 0.5(51) - 0.4187(153) - 0.0813(204) = 128 + 25.5 - 64.06 - 16.59 = \mathbf{72.85 \approx 73}$ ($< 128$ menandakan kurang merah).

---

## 7. Algorithm Pseudocode: Color-Based HSV Segmentation

```text
ALGORITHM SegmentColorRegionHSV(ImageRGB, hue_min, hue_max, sat_min, val_min)
INPUT:
    ImageRGB : Citra masukan H x W x 3
    hue_min, hue_max : Batas sudut rona target (0..360 derajat)
    sat_min, val_min : Ambang batas kemurnian & kecerahan [0..1]
OUTPUT:
    BinaryMask : Masker biner H x W (255 = objek terdeteksi, 0 = latar)

BEGIN
    Initialize BinaryMask[H, W] <- 0
    FOR y <- 0 TO H - 1 DO
        FOR x <- 0 TO W - 1 DO
            (H, S, V) <- RGBtoHSV(ImageRGB[y, x])
            IF H >= hue_min AND H <= hue_max AND S >= sat_min AND V >= val_min THEN
                BinaryMask[y, x] <- 255
            END IF
        END FOR
    END FOR
    RETURN BinaryMask
END
```

---

## 8. Python & OpenCV Implementation

### Prasyarat & Perhatian Penting OpenCV
- Instalasi: `pip install numpy opencv-python-headless`
- **Jebakan Skala OpenCV**: Untuk mengemas sudut $0^\circ - 360^\circ$ ke dalam 1 Byte `uint8` $[0, 255]$, OpenCV membagi nilai Hue dengan 2, sehingga **$H_{\text{OpenCV}} \in [0, 179]$**!

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 07: Color Space Transformation & HSV Segmentation
Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def generate_color_wheel_scene(w: int = 240, h: int = 180) -> np.ndarray:
    """Membuat citra RGB deterministik berisi objek merah, hijau, dan biru."""
    img = np.full((h, w, 3), 40, dtype=np.uint8)
    cv2.rectangle(img, (20, 30), (80, 130), (220, 30, 30), -1)   # Merah (RGB)
    cv2.circle(img, (130, 80), 35, (30, 210, 50), -1)             # Hijau (RGB)
    cv2.rectangle(img, (175, 40), (225, 140), (30, 110, 235), -1) # Biru (RGB)
    return img

if __name__ == "__main__":
    rgb = generate_color_wheel_scene()

    # Konversi antar ruang warna menggunakan OpenCV
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    ycrcb = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)

    # Uji segmentasi warna HIJAU pada HSV OpenCV (Hue Hijau ≈ 120° -> H_cv ≈ 60)
    lower_green = np.array([45, 80, 50], dtype=np.uint8)
    upper_green = np.array([75, 255, 255], dtype=np.uint8)
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    # Verifikasi titik pusat lingkaran hijau (x=130, y=80) terdeteksi 255
    assert mask_green[80, 130] == 255, "Pusat lingkaran hijau harus tersegmentasi!"
    assert mask_green[80, 50] == 0, "Blok merah tidak boleh masuk masker hijau!"
    assert ycrcb.shape == lab.shape == rgb.shape

    green_pixels = int(np.sum(mask_green == 255))
    print(f"Piksel hijau terdeteksi dalam HSV: {green_pixels} piksel")
    print("Verifikasi Transformasi & Segmentasi Ruang Warna BERHASIL!")
```

---

## 9. Interactive Lab — Color Space Converter

Pada tab **Laboratorium & Python**, gunakan **Color Space Converter**:
- Unggah citra Anda sendiri atau pakai pola bilah warna bawaan.
- Beralih antar ruang warna (**RGB**, **Grayscale**, **HSV**, **HSL**, **YCbCr**, dan **CIELAB**) untuk memvisualisasikan ketiga saluran terpisah secara berdampingan.
- Aktifkan kotak centang **Segmentasi Warna HSV** lalu geser sudut **Target Hue** ($0^\circ - 360^\circ$) dan toleransi untuk mengisolasi warna tertentu secara langsung.

---

## 10. Experiments & Analysis

1. **Inspeksi Kanal Kroma YCbCr**: Pilih mode **YCbCr** pada gambar beraneka warna. Perhatikan bagaimana saluran **Y** menampilkan detail tekstur hitam-putih lengkap, sementara saluran **Cb** dan **Cr** terlihat jauh lebih halus dengan warna putih cerah hanya pada area biru atau merah.
2. **Ketahanan Bayangan pada HSV vs RGB**: Amati citra objek berwarna yang memiliki gradasi pencahayaan dari terang ke bayangan. Bandingkan kestabilan nilai pada saluran **Hue (H)** vs nilai **R/G/B**.

---

## 11. Mini Project — Detektor Kematangan Buah Berbasis CIELAB & HSV

Rancang skrip Python yang memisahkan objek buah berwarna kuning/oranye matang (Hue $15^\circ - 45^\circ$ atau $a^*, b^*$ tinggi di CIELAB) dari daun hijau menggunakan segmentasi HSV + pembersihan masker dengan `cv2.inRange`, lalu hitung persentase luas area objek matang terhadap keseluruhan objek.

---

## 12. Summary & Presentation Slides

Akses tab **Presentasi Slide** untuk 10 slide ringkas dan catatan pengajar bab ini.

1. Ruang warna **RGB** merepresentasikan komposisi aditif perangkat keras, namun mencampur informasi warna dan kecerahan.
2. **HSV/HSL** memisahkan *Hue* (rona), *Saturation* (kejenuhan), dan kecerahan—sangat unggul untuk segmentasi berbasis warna.
3. **YCbCr** memisahkan luma dan krominansi, menjadi standar kompresi gambar/video JPEG dan MPEG.
4. **CIELAB ($L^*a^*b^*$)** menyediakan metrik jarak perseptual yang seragam bagi mata manusia.

---

## 13. Verified Academic References

1. **Gonzalez, R. C., & Woods, R. E.** (2018). *Digital Image Processing* (4th ed.). Pearson Education. Chapter 6: Color Image Processing.
2. **Szeliski, R.** (2022). *Computer Vision: Algorithms and Applications* (2nd ed.). Springer. Section 2.3.2: Color.
3. **OpenCV Documentation**. (2024). *Changing Colorspaces — HSV Object Tracking*. Official OpenCV Tutorial.

