"""
Multimedia & Computer Vision Learning Hub
Chapter 03: Multimedia Data Representation & File Formats
Kalkulasi Ukuran Teoretis vs Kompresi Nyata dan Ekstraksi Metadata

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

def calculate_uncompressed_image_size(width: int, height: int, channels: int = 3, bit_depth: int = 8) -> float:
    """Menghitung ukuran data citra mentah dalam Kilobytes (KB)."""
    bytes_per_channel = bit_depth / 8.0
    total_bytes = width * height * channels * bytes_per_channel
    return total_bytes / 1024.0

def calculate_uncompressed_audio_size(sample_rate: int, channels: int, duration_sec: float, bit_depth: int = 16) -> float:
    """Menghitung ukuran berkas audio PCM mentah dalam Megabytes (MB)."""
    bytes_per_sample = bit_depth / 8.0
    total_bytes = sample_rate * channels * bytes_per_sample * duration_sec
    return total_bytes / (1024.0 * 1024.0)

def calculate_compression_ratio(uncompressed_bytes: float, compressed_bytes: float) -> float:
    """Menghitung rasio kompresi data."""
    if compressed_bytes <= 0:
        return 0.0
    return uncompressed_bytes / compressed_bytes

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 03 Verification")
    print("=" * 65)

    # 1. Kasus Citra 4K UHD (3840 x 2160)
    w_4k, h_4k = 3840, 2160
    raw_img_kb = calculate_uncompressed_image_size(w_4k, h_4k, channels=3, bit_depth=8)
    raw_img_mb = raw_img_kb / 1024.0
    print(f"Citra 4K UHD Mentah ({w_4k}x{h_4k} RGB): {raw_img_mb:.2f} MB")
    assert round(raw_img_mb, 1) == 23.7, "Citra 4K 24-bit harus berukuran ~23.7 MB"

    jpeg_size_mb = 1.2
    cr_img = calculate_compression_ratio(raw_img_mb, jpeg_size_mb)
    print(f"Rasio Kompresi JPEG (1.2 MB): {cr_img:.1f}:1 (Penghematan {(1 - 1/cr_img)*100:.1f}%)")

    # 2. Kasus Audio CD Stereo (44.1 kHz, 16-bit, 2 Saluran, 180 detik = 3 menit)
    audio_mb = calculate_uncompressed_audio_size(44100, 2, duration_sec=180.0, bit_depth=16)
    print(f"\nAudio CD 3 Menit Mentah (44.1 kHz, 16-bit Stereo): {audio_mb:.2f} MB")
    assert round(audio_mb, 1) == 30.3, "Audio CD 3 menit harus berukuran ~30.3 MB"

    mp3_size_mb = 2.81
    cr_audio = calculate_compression_ratio(audio_mb, mp3_size_mb)
    print(f"Rasio Kompresi MP3 128kbps (2.81 MB): {cr_audio:.1f}:1 (Penghematan {(1 - 1/cr_audio)*100:.1f}%)")

    print("\nVerifikasi Berhasil: Seluruh formulasi matematis ukuran file tervalidasi!")

if __name__ == "__main__":
    main()
