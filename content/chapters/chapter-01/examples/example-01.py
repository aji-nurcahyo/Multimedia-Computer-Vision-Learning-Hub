"""
Multimedia & Computer Vision Learning Hub
Chapter 01: Introduction to Multimedia & Computer Vision
Demonstrasi Pemeriksaan Sifat Fisik Sinyal Multimedia (Image, Audio, Video)

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def inspect_image_properties():
    print("--- 1. Inspeksi Data Citra Digital ---")
    H, W = 128, 128
    synthetic_image = np.zeros((H, W, 3), dtype=np.uint8)
    synthetic_image[:, :64, 0] = 255  # Kolom kiri: Merah murni
    synthetic_image[:, 64:, 1] = 255  # Kolom kanan: Hijau murni

    print(f"Dimensi Array (Shape): {synthetic_image.shape} -> (Tinggi={H}, Lebar={W}, Saluran={3})")
    print(f"Tipe Data (dtype): {synthetic_image.dtype} (Nilai integer [0 - 255])")
    print(f"Rentang Nilai Intensitas: Min={synthetic_image.min()}, Max={synthetic_image.max()}")
    print(f"Total Memori Tak Terkompresi: {synthetic_image.nbytes} Bytes (~{synthetic_image.nbytes/1024:.2f} KB)")
    assert synthetic_image.shape == (128, 128, 3), "Dimensi citra harus 128x128x3"

def inspect_audio_properties():
    print("\n--- 2. Inspeksi Data Gelombang Audio ---")
    sample_rate = 44100  # 44.1 kHz
    duration_sec = 2.0   # 2 detik
    total_samples = int(sample_rate * duration_sec)
    
    t = np.linspace(0, duration_sec, total_samples, endpoint=False)
    audio_signal = np.sin(2 * np.pi * 440.0 * t).astype(np.float32)

    print(f"Dimensi Array Audio (Shape): {audio_signal.shape} (1D Series)")
    print(f"Frekuensi Sampling (Sample Rate): {sample_rate} Hz")
    print(f"Durasi Sinyal: {duration_sec} detik ({total_samples} sampel total)")
    print(f"Rentang Amplitudo: Min={audio_signal.min():.2f}, Max={audio_signal.max():.2f}")
    print(f"Ukuran Memori Mentah PCM: {audio_signal.nbytes} Bytes (~{audio_signal.nbytes/1024:.2f} KB)")
    assert audio_signal.size == 88200, "Total sampel audio 2 detik pada 44.1 kHz harus 88200"

def inspect_video_properties():
    print("\n--- 3. Inspeksi Data Sekuens Video Temporal ---")
    fps = 30
    duration_sec = 1.0
    T = int(fps * duration_sec)
    H, W = 64, 64
    video_tensor = np.zeros((T, H, W, 3), dtype=np.uint8)

    print(f"Dimensi Tensor Video 4D: {video_tensor.shape} -> (Time={T}, Height={H}, Width={W}, Channels=3)")
    print(f"Kecepatan Putar (Frame Rate): {fps} FPS (Rentang waktu antar frame: {1000/fps:.1f} ms)")
    print(f"Total Piksel yang diproses per detik: {T * H * W * 3} elemen nilai warna")
    assert video_tensor.shape == (30, 64, 64, 3), "Dimensi video 4D harus sesuai"

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 01 Verification")
    print("=" * 65)
    inspect_image_properties()
    inspect_audio_properties()
    inspect_video_properties()
    print("\nVerifikasi Berhasil: Seluruh struktur data multimedia tervalidasi secara numerik!")

if __name__ == "__main__":
    main()
