"""
Multimedia & Computer Vision Learning Hub
Chapter 02: Digital Signals, Sampling & Quantization
Simulasi Sampling Nyquist, Aliasing, dan Uniform Quantization

Author: Aji Pamungkas Tri Nurcahyo (ITERA)
"""

import numpy as np

def simulate_sampling(f_signal: float, f_sample: float, duration: float = 1.0):
    """
    Mensimulasikan pencuplikan sinyal kontinu.
    Menghitung sampel diskrit dan mendeteksi frekuensi semu aliasing.
    """
    n_samples = int(f_sample * duration)
    t_discrete = np.linspace(0, duration, n_samples, endpoint=False)
    x_discrete = np.sin(2 * np.pi * f_signal * t_discrete)

    is_aliased = f_sample < 2 * f_signal
    f_nyquist = f_sample / 2.0
    f_apparent = abs(f_signal - round(f_signal / f_sample) * f_sample)

    return {
        "f_signal": f_signal,
        "f_sample": f_sample,
        "f_nyquist": f_nyquist,
        "is_aliased": is_aliased,
        "f_apparent": f_apparent,
        "n_samples": n_samples,
        "samples": x_discrete
    }

def uniform_quantize(signal: np.ndarray, bit_depth: int, v_min: float = -1.0, v_max: float = 1.0):
    """
    Melakukan kuantisasi seragam (mid-tread rounding).
    Mengembalikan sinyal terkuantisasi, error kuantisasi, dan nilai SQNR empiris.
    """
    levels = 2 ** bit_depth
    delta = (v_max - v_min) / levels

    clamped = np.clip(signal, v_min, v_max)
    indices = np.round((clamped - v_min) / delta)
    indices = np.clip(indices, 0, levels - 1)

    quantized = v_min + indices * delta + (delta / 2.0)
    error = quantized - signal

    p_signal = np.mean(signal ** 2)
    p_noise = np.mean(error ** 2)
    sqnr_db = 10 * np.log10(p_signal / p_noise) if p_noise > 0 else 999.0

    return quantized, error, sqnr_db, delta

def main():
    print("=" * 65)
    print("Multimedia & Computer Vision Hub - Chapter 02 Verification")
    print("=" * 65)

    # 1. Uji Teorema Sampling & Aliasing
    res1 = simulate_sampling(f_signal=8.0, f_sample=40.0) # fs >= 2f (Normal)
    print(f"Eksperimen A (f=8 Hz, fs=40 Hz): Nyquist={res1['f_nyquist']} Hz | Aliasing={res1['is_aliased']}")
    assert not res1['is_aliased'], "fs=40 Hz harus memenuhi kriteria Nyquist untuk sinyal 8 Hz."

    res2 = simulate_sampling(f_signal=8.0, f_sample=10.0) # fs < 2f (Aliased)
    print(f"Eksperimen B (f=8 Hz, fs=10 Hz): Nyquist={res2['f_nyquist']} Hz | Aliasing={res2['is_aliased']} | Frekuensi Semu={res2['f_apparent']} Hz")
    assert res2['is_aliased'], "fs=10 Hz harus memicu aliasing untuk sinyal 8 Hz."

    # 2. Uji Kuantisasi & SQNR (Aturan 6 dB per bit)
    t = np.linspace(0, 1.0, 10000, endpoint=False)
    test_sine = np.sin(2 * np.pi * 5.0 * t) # Sinyal uji amplitudo 1.0

    _, _, sqnr_4bit, delta_4 = uniform_quantize(test_sine, bit_depth=4)
    _, _, sqnr_8bit, delta_8 = uniform_quantize(test_sine, bit_depth=8)

    print(f"\nKuantisasi 4-bit: Step Delta={delta_4:.4f} | Empiris SQNR={sqnr_4bit:.2f} dB (Teori ~25.8 dB)")
    print(f"Kuantisasi 8-bit: Step Delta={delta_8:.4f} | Empiris SQNR={sqnr_8bit:.2f} dB (Teori ~49.9 dB)")
    
    delta_sqnr = sqnr_8bit - sqnr_4bit
    print(f"Kenaikan SQNR dari 4 ke 8 bit: {delta_sqnr:.2f} dB (~24 dB / 6 dB per bit)")
    assert delta_sqnr > 20.0, "Kenaikan 4 bit harus meningkatkan SQNR setidaknya 20 dB."

    print("\nVerifikasi Numerik Berhasil: Teorema sampling dan hukum kuantisasi tervalidasi!")

if __name__ == "__main__":
    main()
