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

    py_ver = sys.version_info
    print(f"Sistem Operasi      : {platform.system()} {platform.release()} ({platform.architecture()[0]})")
    print(f"Versi Python        : {py_ver.major}.{py_ver.minor}.{py_ver.micro}")
    assert py_ver.major == 3 and py_ver.minor >= 10, "Disyaratkan Python 3.10 atau lebih baru!"

    # 1. Periksa NumPy
    import numpy as np
    print(f"NumPy Version       : {np.__version__} (OK)")

    # 2. Periksa Pillow
    try:
        import PIL
        print(f"Pillow Version      : {PIL.__version__} (OK)")
    except ImportError:
        print("Pillow Version      : Opsional (pip install pillow)")

    # 3. Uji Alokasi Tensor NumPy
    test_tensor = np.ones((10, 10), dtype=np.float32)
    assert test_tensor.sum() == 100.0, "Uji alokasi memori NumPy gagal!"

    print("=" * 65)
    print("Hasil Diagnostik: Lingkungan Python siap untuk praktikum multimedia!")
    return True

if __name__ == "__main__":
    verify_environment()
