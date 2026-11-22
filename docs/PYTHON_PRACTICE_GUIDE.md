# Python Practice & Reproducibility Guide

## Pedoman Praktik Pemrograman Python Ramah-CPU

Dalam platform ini, Python adalah bahasa pemrograman praktis utama untuk mengimplementasikan algoritma pemrosesan citra digital, audio, video, dan visi komputer.

---

## 1. Prinsip Utama Pemrograman Praktis

1. **Ramah CPU (CPU-Friendly First)**:
   - Mahasiswa memiliki variasi spesifikasi laptop (banyak yang tidak memiliki GPU diskrit NVIDIA).
   - Seluruh contoh kode dasar wajib dapat dieksekusi dengan lancar pada CPU standar dalam waktu kurang dari 5 detik.
   - Untuk Deep Learning (Bab 41–50), gunakan model pra-latih berbobot ringan (misalnya `MobileNetV3`, `YOLOv8n`, `SqueezeNet`) pada citra resolusi kecil.
2. **Kemandirian Algoritmik**:
   - Selalu sertakan implementasi dari nol (*from scratch*) menggunakan **NumPy murni** agar mahasiswa memahami logika matematis di balik algoritma.
   - Setelah itu, tunjukkan implementasi teroptimasi industri menggunakan **OpenCV (`cv2`)**, **SciPy**, atau **Librosa**.
3. **Verifikasi Numerik**:
   - Sertakan pernyataan `assert` atau uji perbandingan numerik (`np.allclose`) untuk membuktikan kebenaran implementasi mandiri terhadap fungsi pustaka resmi.

---

## 2. Struktur Standar Skrip Python (`example-XX.py`)

Setiap skrip Python di dalam `examples/` harus memiliki struktur:

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter XX: [Judul Bab]
Topik: [Deskripsi Singkat Contoh]

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np
import cv2

def fungsi_algoritma_mandiri(input_data):
    """Dokumentasi fungsi dan tipe data."""
    # Langkah komputasi terstruktur
    pass

def main():
    print("Menjalankan demonstrasi Bab XX...")
    # 1. Menyiapkan data uji sintetis / citra contoh
    # 2. Menjalankan fungsi
    # 3. Menampilkan hasil dan metrik verifikasi

if __name__ == "__main__":
    main()
```

---

## 3. Menjalankan Skrip Verifikasi

Untuk menguji skrip bab tertentu:

```bash
python content/chapters/chapter-10/examples/example-01.py
```

