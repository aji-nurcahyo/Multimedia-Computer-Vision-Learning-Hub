"""
Multimedia & Computer Vision Learning Hub
Chapter 18: Fourier Transform & Spectral Analysis
Implementasi Python & Verifikasi Algoritma Audio Digital

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
Institution: Institut Teknologi Sumatera (ITERA)
"""

import numpy as np
import wave
import struct
import math

def generate_test_tone(freq: float = 440.0, duration: float = 0.5, sample_rate: int = 44100, amp: float = 0.8) -> np.ndarray:
    """Menghasilkan sinyal nada sinus murni ternormalisasi."""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    signal = amp * np.sin(2.0 * np.pi * freq * t)
    return signal.astype(np.float32)

def compute_rms_energy(signal: np.ndarray) -> float:
    """Menghitung Root Mean Square (RMS) energy sinyal."""
    return float(np.sqrt(np.mean(signal ** 2)))

def compute_zero_crossing_rate(signal: np.ndarray) -> float:
    """Menghitung Zero Crossing Rate (ZCR) sinyal."""
    zero_crossings = np.nonzero(np.diff(signal >= 0))[0]
    return float(len(zero_crossings) / (len(signal) - 1))

def save_wav(filename: str, signal: np.ndarray, sample_rate: int = 44100) -> None:
    """Menyimpan larik float32 ke format file RIFF WAV 16-bit PCM standar."""
    clamped = np.clip(signal, -1.0, 1.0)
    int_samples = (clamped * 32767.0).astype(np.int16)
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())

def main() -> None:
    print("=" * 65)
    print("Multimedia & Computer Vision Learning Hub - ITERA")
    print(f"Chapter 18: Fourier Transform & Spectral Analysis")
    print("Created by: Aji Pamungkas Tri Nurcahyo")
    print("=" * 65)

    sample_rate = 16000
    duration = 0.2
    freq = 440.0

    # 1. Sintesis Sinyal Audio Uji
    signal = generate_test_tone(freq, duration, sample_rate, 0.8)
    print(f"[*] Jumlah sampel audio: {len(signal)} sampel ({duration} detik @ {sample_rate} Hz)")

    # 2. Ekstraksi Metrik Domain Waktu
    rms = compute_rms_energy(signal)
    zcr = compute_zero_crossing_rate(signal)
    print(f"[*] RMS Energy terukur : {rms:.4f}")
    print(f"[*] Zero Crossing Rate : {zcr:.4f}")

    # 3. Verifikasi Spektral FFT 1D
    n_fft = 1024
    frame = signal[:n_fft] * np.hanning(n_fft)
    fft_vals = np.fft.rfft(frame)
    mags = np.abs(fft_vals)
    peak_bin = int(np.argmax(mags))
    detected_freq = (peak_bin * sample_rate) / n_fft
    print(f"[*] Frekuensi puncak FFT: {detected_freq:.1f} Hz (Ekspektasi: {freq} Hz)")

    # Assertions
    assert abs(detected_freq - freq) < (sample_rate / n_fft), "Deteksi frekuensi FFT tidak akurat!"
    assert 0.4 < rms < 0.7, "RMS energy di luar batas toleransi sinusoidal!"
    assert zcr > 0.04, "Zero Crossing Rate terlalu rendah!"

    print("[SUCCESS] Semua pengujian deterministik Bab 18 lolos verifikasi!")
    print("=" * 65)

if __name__ == '__main__':
    main()
