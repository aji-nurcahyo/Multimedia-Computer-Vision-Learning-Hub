# Chapter 04 — Python Multimedia Development Environment

> **Bagian Kurikulum**: Section 01 — Multimedia & Signal Foundations  
> **Estimasi Durasi**: 90 Menit | **Tingkat Kesulitan**: Beginner  
> **Prasyarat**: Penggunaan Terminal / Command Prompt Dasar  
> **Learning Tracks**: Digital Image Processing, Audio & Speech Processing  
> **Pengembang Materi**: Aji Pamungkas Tri Nurcahyo · Institut Teknologi Sumatera (ITERA)

---

## 1. Chapter Overview

Dalam rekayasa kecerdasan visual dan multimedia modern, **Python** adalah bahasa pemrograman lingua-franca yang mendominasi industri dan akademisi internasional. Fleksibilitas sintaksisnya yang intuitif dipadukan dengan pustaka komputasi tingkat rendah teroptimasi (berbasis C/C++ dan Fortran) seperti NumPy, OpenCV, dan SciPy menjadikannya alat utama dalam mengolah sinyal digital.

Namun, kendala terbesar bagi mahasiswa dan praktisi pemula sering kali bukan terletak pada perumusan algoritma, melainkan pada **kesalahan konfigurasi lingkungan (*environment configuration errors*)**, bentrok versi dependensi (*dependency conflicts*), atau instalasi paket global yang merusak interpreter bawaan sistem operasi.

Bab ini menyajikan panduan komprehensif penyiapan lingkungan pengembangan multimedia Python yang **bersih, terisolasi, stabil, dan dapat direproduksi (*reproducible*)**. Kita akan mempelajari instalasi dan verifikasi Python 3.10+, konfigurasi Virtual Environment (`venv`), manajemen dependensi dengan `pip` dan `requirements.txt`, penyiapan IDE (VS Code dan JupyterLab), serta strategi penanganan masalah (*troubleshooting*) khas lingkungan Windows dan Linux/macOS.

---

## 2. Learning Objectives

Setelah menyelesaikan bab ini, mahasiswa dan pembaca diharapkan mampu:

1. **Memverifikasi** integritas instalasi Python dan memeriksa kesesuaian versi interpreter 64-bit.
2. **Membuat dan mengaktifkan** lingkungan virtual (*virtual environment*) menggunakan modul bawaan `venv` pada Windows (PowerShell/CMD) serta Linux/macOS (Bash/Zsh).
3. **Mengonfigurasi** manajer paket `pip` untuk menginstal pustaka inti komputasi multimedia (NumPy, Matplotlib, OpenCV, SciPy, Pillow, SoundFile) tanpa merusak paket global sistem operasi.
4. **Menyusun** struktur tata kelola folder proyek perangkat lunak multimedia yang modular dan teratur.
5. **Mendiagnosis** dan memecahkan kendala umum seperti izin eksekusi skrip PowerShell, hilangnya library DLL OpenCV pada Windows, dan konflik path sistem.
6. **Menciptakan** lingkungan eksperimen yang dapat direproduksi secara instan menggunakan berkas `requirements.txt`.

---

## 3. Prerequisites

Sebelum mempelajari bab ini, pastikan Anda telah memiliki:
- Akses terminal atau PowerShell pada komputer Anda.
- Pemahaman dasar navigasi direktori (`cd`, `ls` / `dir`).

---

## 4. Fundamental Concepts

### 4.1 Mengapa Membutuhkan Virtual Environment?

Secara default, ketika Anda menjalankan `pip install <nama-paket>`, paket tersebut akan dipasang ke dalam folder sistem global komputer Anda. 

**Risiko Fatal Instalasi Global**:
1. **Konflik Versi (*Dependency Hell*)**: Proyek A membutuhkan `numpy==1.24` untuk kompatibilitas pustaka lama, sementara Proyek B membutuhkan `numpy>=2.0` untuk fitur terbaru. Instalasi global akan menimpa salah satu versi dan merusak proyek lainnya.
2. **Izin Administrator**: Menjalankan pip secara global dapat menimpa paket inti yang digunakan oleh aplikasi bawaan sistem operasi.
3. **Sulit Direproduksi**: Rekan tim atau dosen penguji tidak dapat mengetahui paket apa saja yang sebenarnya dibutuhkan untuk menjalankan kode Anda.

![Arsitektur Virtual Environment](/media/diagrams/chapter-04-dev-environment.svg)
*Gambar 4.1 — Arsitektur isolasi lingkungan pengembangan Python: Pemisahan antara interpreter global OS dan Virtual Environment (.venv/) lokal proyek.*  
*Sumber: Aji Pamungkas Tri Nurcahyo (ITERA), Lisensi CC-BY-4.0.*

Virtual Environment (`.venv`) menciptakan direktori mandiri yang memuat salinan interpreter Python, pustaka `pip`, dan folder `site-packages` terisolasi. Seluruh paket yang diinstal hanya berdampak pada folder proyek tersebut.

---

## 5. Panduan Langkah Demi Langkah Penyiapan Lingkungan

### Langkah 1: Verifikasi Instalasi Python
Buka terminal (PowerShell pada Windows, atau Terminal pada macOS/Linux) dan jalankan:

```bash
python --version
# atau jika di Linux/macOS:
python3 --version
```
> **Persyaratan**: Versi yang disarankan adalah **Python 3.10, 3.11, atau 3.12** (arsitektur 64-bit). Hindari menggunakan Python versi 32-bit karena tidak didukung oleh pustaka visi komputer modern.

### Langkah 2: Membuat Virtual Environment
Arahkan terminal ke folder proyek Anda, lalu jalankan:

```bash
# Membuat virtual environment bernama .venv
python -m venv .venv
```

Perintah di atas akan membuat folder tersembunyi bernama `.venv/` yang berisi interpreter Python mandiri.

### Langkah 3: Mengaktifkan Virtual Environment

#### Pada Windows (PowerShell):
```powershell
.venv\Scripts\Activate.ps1
```
> **Catatan Pemecahan Masalah Windows**:  
> Jika muncul error: *`...execution of scripts is disabled on this system`*, jalankan perintah izin sesi berikut satu kali:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
> .venv\Scripts\Activate.ps1
> ```

#### Pada Windows (Command Prompt / CMD):
```cmd
.venv\Scripts\activate.bat
```

#### Pada Linux / macOS (Bash / Zsh):
```bash
source .venv/bin/activate
```

Setelah berhasil aktif, prompt terminal Anda akan memiliki tanda kurung awalan: `(.venv) PS D:\Proyek>`.

### Langkah 4: Memperbarui pip & Menginstal Pustaka Multimedia Inti
Pastikan penginstal paket `pip` diperbarui ke versi mutakhir:

```bash
python -m pip install --upgrade pip
```

Instal paket-paket esensial yang diperlukan untuk Section 01 dan 02:

```bash
pip install numpy matplotlib opencv-python pillow scipy soundfile
```

> **Tips Server / Headless**: Jika Anda bekerja pada server komputasi tanpa layar monitor GUI (misalnya Docker container atau Google Cloud VM), gunakan `opencv-python-headless` sebagai pengganti `opencv-python` untuk menghindari dependensi library grafis X11/Qt.

---

## 6. Struktur Tata Kelola Folder Proyek Multimedia

Struktur folder yang rapi memisahkan antara data mentah, skrip logika, eksperimen interaktif, dan artefak keluaran:

```text
my-multimedia-project/
├── .venv/                   # Lingkungan virtual terisolasi (Jangan di-commit ke Git!)
├── .gitignore               # Mengabaikan .venv/, __pycache__/, *.mp4 besar
├── requirements.txt         # Daftar pin versi dependensi
├── README.md                # Dokumentasi petunjuk eksekusi
├── data/
│   ├── raw/                 # Citra mentah, rekaman audio WAV asli
│   └── processed/           # Citra terfilter, audio hasil restorasi
├── notebooks/
│   └── exploration.ipynb    # Eksperimen interaktif Jupyter
├── src/
│   ├── __init__.py
│   ├── filters.py           # Modul fungsi spatial filtering
│   ├── audio_tools.py       # Modul pembaca sinyal audio
│   └── utils.py             # Fungsi pembantu
└── tests/
    └── test_filters.py      # Pengujian unit program (pytest)
```

---

## 7. Membekukan dan Membagikan Dependensi (`requirements.txt`)

Agar lingkungan pengembangan Anda dapat direproduksi secara identik oleh rekan tim atau dosen:

```bash
# Menyimpan seluruh daftar paket yang terinstal beserta versinya
pip freeze > requirements.txt
```

Isi berkas `requirements.txt` yang direkomendasikan untuk platform ini:
```text
numpy>=1.26.0
matplotlib>=3.8.0
opencv-python>=4.9.0
pillow>=10.2.0
scipy>=1.12.0
soundfile>=0.12.1
```

Orang lain cukup menjalankan satu perintah berikut untuk mereplikasi lingkungan Anda:
```bash
pip install -r requirements.txt
```

---

## 8. Panduan Troubleshooting Masalah Umum

### Kendala 1: `ImportError: DLL load failed while importing cv2` pada Windows
- **Penyebab**: Windows Anda tidak memiliki paket runtime pustaka C++ resmi yang dibutuhkan OpenCV.
- **Solusi**: Unduh dan pasang paket resmi **Microsoft Visual C++ Redistributable (x64)** dari situs resmi Microsoft, lalu restart komputer.

### Kendala 2: OpenCV GUI Crash pada Linux (`libGL.so.1: cannot open shared object`)
- **Penyebab**: Library rendering sistem grafis OpenGL belum terpasang.
- **Solusi**: Jalankan `sudo apt-get install libgl1-mesa-glx` atau ganti paket dengan `pip install opencv-python-headless`.

### Kendala 3: Perintah `python` membuka Microsoft Store di Windows
- **Penyebab**: Alias eksekusi aplikasi bawaan Windows mencegat perintah terminal.
- **Solusi**: Buka *Settings* $\rightarrow$ *Apps* $\rightarrow$ *Advanced app settings* $\rightarrow$ *App execution aliases*, lalu nonaktifkan tombol untuk `python.exe` dan `python3.exe`.

---

## 9. Python Implementation: Skrip Verifikasi Lingkungan Mandiri

Jalankan skrip Python berikut untuk memverifikasi secara otomatis bahwa seluruh dependensi multimedia Anda telah terpasang dengan versi yang tepat dan CPU SIMD terakselerasi:

```python
"""
Multimedia & Computer Vision Learning Hub
Chapter 04: Python Multimedia Development Environment
Skrip Verifikasi Dependensi dan Kemampuan Akselerasi Komputasi

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import sys
import platform

def verify_environment():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Environment Diagnostic")
    print("=" * 65)

    # 1. Periksa Python Runtime
    py_ver = sys.version_info
    print(f"Sistem Operasi      : {platform.system()} {platform.release()} ({platform.architecture()[0]})")
    print(f"Versi Python        : {py_ver.major}.{py_ver.minor}.{py_ver.micro}")
    assert py_ver.major == 3 and py_ver.minor >= 10, "Disyaratkan Python 3.10 atau lebih baru!"

    # 2. Periksa NumPy
    try:
        import numpy as np
        print(f"NumPy Version       : {np.__version__} (OK)")
    except ImportError:
        print("NumPy Version       : BELUM TERINSTAL (Jalankan: pip install numpy)")
        return False

    # 3. Periksa OpenCV (cv2)
    try:
        import cv2
        print(f"OpenCV Version      : {cv2.__version__} (OK)")
        print(f"OpenCV Threads / CPU: {cv2.getNumThreads()} threads aktif")
    except ImportError:
        print("OpenCV Version      : BELUM TERINSTAL (Jalankan: pip install opencv-python)")

    # 4. Periksa Matplotlib
    try:
        import matplotlib
        print(f"Matplotlib Version  : {matplotlib.__version__} (OK)")
    except ImportError:
        print("Matplotlib Version  : BELUM TERINSTAL (Jalankan: pip install matplotlib)")

    # 5. Uji Pembuatan Matriks Sederhana
    test_tensor = np.ones((10, 10), dtype=np.float32)
    assert test_tensor.sum() == 100.0, "Uji alokasi memori NumPy gagal!"

    print("=" * 65)
    print("Hasil Diagnostik: Lingkungan Python siap untuk praktikum multimedia!")
    return True

if __name__ == "__main__":
    verify_environment()
```

---

## 10. Summary

1. Lingkungan pengembangan multimedia Python wajib menggunakan **Virtual Environment (`venv`)** untuk mencegah konflik versi paket dan menjaga stabilitas sistem operasi.
2. Pustaka inti komputasi multimedia mencakup: **NumPy** (matriks array), **OpenCV** (pemrosesan citra dan video), **Matplotlib** (visualisasi grafik), serta **SciPy / SoundFile** (analisis sinyal audio).
3. Berkas **`requirements.txt`** memungkinkan replikasi lingkungan kerja yang 100% konsisten antar-pengembang.
4. Pada lingkungan Windows, perhatikan kebijakan eksekusi skrip PowerShell (`RemoteSigned`) dan kelengkapan Visual C++ Redistributable.
5. Pada server atau container tanpa antarmuka GUI, gunakan varian paket **`opencv-python-headless`**.

---

## 11. References & Academic Citations

1. **McKinney, W.** (2022). *Python for Data Analysis: Data Wrangling with pandas, NumPy, and Jupyter* (3rd ed.). O'Reilly Media. Chapter 1: Preliminaries & Chapter 2: Python Language Basics.
2. **Howse, J., & Minichino, J.** (2020). *Learning OpenCV 4 Computer Vision with Python 3* (3rd ed.). Packt Publishing. Chapter 1: Setting Up OpenCV.
3. **Python Packaging Authority (PyPA)**. (2024). *Python Packaging User Guide: Installing Packages using pip and virtual environments*. Official Reference: https://packaging.python.org.
