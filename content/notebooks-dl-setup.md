# Panduan Setup Lingkungan Deep Learning (Chapters 41–45)
## Multimedia & Computer Vision Learning Hub — ITERA
**Author:** Aji Pamungkas Tri Nurcahyo  
**Institusi:** Institut Teknologi Sumatera (ITERA)  

Modul perkuliahan Computer Vision Bab 41–45 dirancang dengan filosofi **Dual-Engine Execution**:
1. **Engine 1: Offline Default (NumPy & OpenCV)**: Berjalan 100% offline secara deterministik pada CPU tanpa dependensi GPU atau framework berat. Mahasiswa dapat mempelajari seluruh rumus matematika, arsitektur dasar, dan logika komputasi langsung di host standar.
2. **Engine 2: Real Deep Learning (PyTorch, Torchvision & Ultralytics)**: Disediakan untuk pelatihan model nyata, transfer learning, deteksi objek YOLO riil, dan segmentasi instansi. Dapat dijalankan di mesin lokal dengan virtual environment atau di Google Colab.

---

### Opsi A: Google Colab (Direkomendasikan untuk Mahasiswa & GPU Gratis)
Seluruh notebook di `content/chapters/chapter-41/notebooks/` hingga `chapter-45/notebooks/` menyertakan sel pembuka otomatis untuk instalasi dan deteksi CUDA di Google Colab:
```bash
# Cukup jalankan sel pertama di Google Colab:
!pip install -q torch torchvision ultralytics matplotlib
```
Pilih runtime: `Runtime -> Change runtime type -> Hardware accelerator -> T4 GPU`.

---

### Opsi B: Virtual Environment Lokal (CPU Saja - Ringan)
Untuk menjalankan inferensi PyTorch CPU di laptop/komputer pribadi:
```bash
# 1. Buat virtual environment terisolasi
python -m venv .venv-cv-dl

# 2. Aktivasi environment (Windows PowerShell)
.venv-cv-dl\Scripts\Activate.ps1
# Atau di Linux/macOS:
# source .venv-cv-dl/bin/activate

# 3. Pasang PyTorch CPU dan pustaka pendukung
pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements-dl.txt
```

---

### Opsi C: Virtual Environment Lokal (NVIDIA GPU / CUDA 12.1+)
Jika workstation Anda memiliki kartu grafis NVIDIA GeForce / RTX:
```bash
# Pasang PyTorch CUDA 12.1:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements-dl.txt
```

---

### Lisensi Model & Dataset
- **PyTorch & Torchvision**: Lisensi BSD-3-Clause (Open Source, izin komersial dan akademik).
- **YOLOv8 (Ultralytics)**: Lisensi AGPL-3.0 (Open Source akademik & riset).
- **CIFAR-10**: Open Academic Use (Alex Krizhevsky, MIT).
- **MS COCO & Oxford Pet**: Creative Commons Attribution 4.0.

