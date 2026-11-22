/**
 * Audio Processing Algorithms & DSP Engine
 * Multimedia & Computer Vision Learning Hub
 * Author: Aji Pamungkas Tri Nurcahyo
 * Institution: Institut Teknologi Sumatera (ITERA)
 *
 * Core pure functions for audio synthesis, PCM representation,
 * 1D FFT / STFT, digital filtering, audio features, speech processing, and evaluation metrics.
 */

// ==========================================
// 1. Types & Data Structures
// ==========================================

export interface AudioSignal {
  sampleRate: number;
  channels: Float32Array[]; // Normalized [-1.0, 1.0] per channel
}

export interface StftResult {
  spectrogram: Float32Array[]; // [timeIndex][freqBin] in dB or linear magnitude
  times: number[]; // Time in seconds for each frame
  frequencies: number[]; // Frequency in Hz for each bin
  sampleRate: number;
  nFft: number;
  hopSize: number;
}

export interface AudioFeatures {
  rmsEnergy: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  spectralSpread: number;
  spectralFlatness: number;
  spectralRolloff: number;
}

export interface VadSegment {
  startSec: number;
  endSec: number;
  isSpeech: boolean;
}

// ==========================================
// 2. Audio Synthesis & Signal Generation
// ==========================================

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise' | 'harmonic' | 'chirp';

/**
 * Generate synthetic audio signal buffer
 */
export function generateSyntheticAudio(
  type: WaveformType,
  frequency: number,
  durationSec: number,
  sampleRate: number = 44100,
  amplitude: number = 0.8,
  phaseRad: number = 0
): Float32Array {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Float32Array(numSamples);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    switch (type) {
      case 'sine':
        sample = Math.sin(twoPi * frequency * t + phaseRad);
        break;

      case 'square': {
        const phi = (twoPi * frequency * t + phaseRad) % twoPi;
        sample = phi < Math.PI ? 1.0 : -1.0;
        break;
      }

      case 'sawtooth': {
        const phi = (frequency * t + phaseRad / twoPi) % 1.0;
        sample = 2.0 * (phi >= 0 ? phi : phi + 1.0) - 1.0;
        break;
      }

      case 'triangle': {
        const phi = (frequency * t + phaseRad / twoPi) % 1.0;
        const normalized = phi >= 0 ? phi : phi + 1.0;
        sample = 2.0 * Math.abs(2.0 * (normalized - Math.floor(normalized + 0.5))) - 1.0;
        break;
      }

      case 'noise':
        // White Gaussian-ish noise via Box-Muller
        sample = (Math.random() * 2 - 1) * 0.9;
        break;

      case 'harmonic':
        // Fundamental + 2nd, 3rd harmonics (like musical timbre)
        sample =
          0.6 * Math.sin(twoPi * frequency * t + phaseRad) +
          0.3 * Math.sin(twoPi * frequency * 2 * t + phaseRad) +
          0.1 * Math.sin(twoPi * frequency * 3 * t + phaseRad);
        break;

      case 'chirp': {
        // Linear frequency chirp from frequency to frequency * 4
        const f0 = frequency;
        const f1 = frequency * 4;
        const k = (f1 - f0) / (durationSec || 1);
        sample = Math.sin(twoPi * (f0 * t + 0.5 * k * t * t) + phaseRad);
        break;
      }
    }

    buffer[i] = Math.max(-1.0, Math.min(1.0, sample * amplitude));
  }

  return buffer;
}

// ==========================================
// 3. PCM Encoding & RIFF WAV Blob Generation
// ==========================================

/**
 * Creates standard 16-bit or 8-bit PCM RIFF WAV Blob from Float32Array channel buffers
 */
export function createWavBlob(
  channels: Float32Array[],
  sampleRate: number = 44100,
  bitDepth: 8 | 16 = 16
): Blob {
  const numChannels = channels.length;
  const numSamples = channels[0].length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // chunkSize
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // audioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  if (bitDepth === 16) {
    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const s = Math.max(-1.0, Math.min(1.0, channels[ch][i]));
        const int16 = s < 0 ? Math.floor(s * 0x8000) : Math.min(0x7fff, Math.floor(s * 0x7fff));
        view.setInt16(offset, int16, true);
        offset += 2;
      }
    }
  } else {
    // 8-bit unsigned PCM [0, 255] (128 is center)
    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const s = Math.max(-1.0, Math.min(1.0, channels[ch][i]));
        const uint8 = Math.min(255, Math.max(0, Math.floor((s + 1.0) * 127.5)));
        view.setUint8(offset, uint8);
        offset += 1;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Decode standard 16-bit PCM RIFF WAV ArrayBuffer to AudioSignal Float32Array
 */
export function decodeWavBuffer(arrayBuffer: ArrayBuffer): AudioSignal {
  const view = new DataView(arrayBuffer);
  // Simple RIFF header parsing
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') {
    throw new Error('Format file bukan WAV/RIFF yang valid');
  }

  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  // Find data chunk
  let pos = 12;
  while (pos < view.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(pos),
      view.getUint8(pos + 1),
      view.getUint8(pos + 2),
      view.getUint8(pos + 3)
    );
    const chunkSize = view.getUint32(pos + 4, true);
    if (chunkId === 'data') {
      pos += 8;
      const numSamples = Math.floor(chunkSize / ((bitsPerSample / 8) * numChannels));
      const channels: Float32Array[] = [];
      for (let ch = 0; ch < numChannels; ch++) {
        channels.push(new Float32Array(numSamples));
      }

      if (bitsPerSample === 16) {
        for (let i = 0; i < numSamples; i++) {
          for (let ch = 0; ch < numChannels; ch++) {
            const intVal = view.getInt16(pos, true);
            channels[ch][i] = intVal / 32768.0;
            pos += 2;
          }
        }
      } else if (bitsPerSample === 8) {
        for (let i = 0; i < numSamples; i++) {
          for (let ch = 0; ch < numChannels; ch++) {
            const uintVal = view.getUint8(pos);
            channels[ch][i] = (uintVal - 128) / 128.0;
            pos += 1;
          }
        }
      } else {
        throw new Error(`Bit depth ${bitsPerSample} belum didukung secara langsung.`);
      }

      return { sampleRate, channels };
    }
    pos += 8 + chunkSize;
  }

  throw new Error('Chunk "data" tidak ditemukan pada file WAV.');
}

// ==========================================
// 4. Quantization, Aliasing & Resampling
// ==========================================

/**
 * Simulate uniform mid-rise / mid-tread quantization
 */
export function quantizeAudio(signal: Float32Array, bitDepth: number): Float32Array {
  const levels = Math.pow(2, bitDepth);
  const halfLevels = levels / 2;
  const out = new Float32Array(signal.length);

  for (let i = 0; i < signal.length; i++) {
    const s = Math.max(-1.0, Math.min(1.0, signal[i]));
    // Map [-1, 1] to [-halfLevels, halfLevels - 1]
    const quantized = Math.round(s * (halfLevels - 1));
    out[i] = quantized / (halfLevels - 1);
  }
  return out;
}

/**
 * Calculate Signal to Quantization Noise Ratio (SQNR) in dB
 */
export function calculateSqnr(original: Float32Array, quantized: Float32Array): number {
  let signalPower = 0;
  let noisePower = 0;
  for (let i = 0; i < original.length; i++) {
    signalPower += original[i] * original[i];
    const noise = original[i] - quantized[i];
    noisePower += noise * noise;
  }
  if (noisePower === 0) return 100;
  if (signalPower === 0) return 0;
  return 10 * Math.log10(signalPower / noisePower);
}

/**
 * Basic resampling using Linear Interpolation
 */
export function resampleAudio(
  signal: Float32Array,
  origRate: number,
  targetRate: number
): Float32Array {
  if (origRate === targetRate) return new Float32Array(signal);
  const ratio = origRate / targetRate;
  const targetLength = Math.floor(signal.length / ratio);
  const output = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio;
    const i0 = Math.floor(srcIndex);
    const i1 = Math.min(i0 + 1, signal.length - 1);
    const frac = srcIndex - i0;
    output[i] = signal[i0] * (1 - frac) + signal[i1] * frac;
  }
  return output;
}

// ==========================================
// 5. 1D FFT / IFFT (Radix-2 Cooley-Tukey)
// ==========================================

export type WindowFunction = 'rectangular' | 'hann' | 'hamming' | 'blackman';

/**
 * Generate window function coefficients
 */
export function getWindowCoefficients(size: number, type: WindowFunction): Float32Array {
  const win = new Float32Array(size);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < size; i++) {
    switch (type) {
      case 'rectangular':
        win[i] = 1.0;
        break;
      case 'hann':
        win[i] = 0.5 * (1 - Math.cos((twoPi * i) / (size - 1)));
        break;
      case 'hamming':
        win[i] = 0.54 - 0.46 * Math.cos((twoPi * i) / (size - 1));
        break;
      case 'blackman':
        win[i] =
          0.42 -
          0.5 * Math.cos((twoPi * i) / (size - 1)) +
          0.08 * Math.cos((2 * twoPi * i) / (size - 1));
        break;
    }
  }
  return win;
}

/**
 * 1D In-place Radix-2 Cooley-Tukey FFT (real & imag arrays of size power of 2)
 */
export function fftRadix2(real: Float64Array, imag: Float64Array, inverse: boolean = false): void {
  const n = real.length;
  if ((n & (n - 1)) !== 0) {
    throw new Error('Ukuran FFT harus berupa bilangan pangkat 2 (power of 2).');
  }

  // Bit reversal
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Butterfly computations
  const sign = inverse ? 1 : -1;
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = (sign * 2 * Math.PI) / len;
    const wStepReal = Math.cos(angle);
    const wStepImag = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wReal = 1.0;
      let wImag = 0.0;
      for (let k = 0; k < half; k++) {
        const posEven = i + k;
        const posOdd = i + k + half;

        const uReal = real[posEven];
        const uImag = imag[posEven];

        const tReal = wReal * real[posOdd] - wImag * imag[posOdd];
        const tImag = wReal * imag[posOdd] + wImag * real[posOdd];

        real[posEven] = uReal + tReal;
        imag[posEven] = uImag + tImag;
        real[posOdd] = uReal - tReal;
        imag[posOdd] = uImag - tImag;

        const nextWReal = wReal * wStepReal - wImag * wStepImag;
        const nextWImag = wReal * wStepImag + wImag * wStepReal;
        wReal = nextWReal;
        wImag = nextWImag;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      real[i] /= n;
      imag[i] /= n;
    }
  }
}

/**
 * Compute Magnitude Spectrum (half spectrum up to Nyquist)
 */
export function computeMagnitudeSpectrum(
  signal: Float32Array,
  windowType: WindowFunction = 'hann',
  nFft: number = 1024
): { magnitudes: Float32Array; magnitudesDb: Float32Array } {
  const win = getWindowCoefficients(nFft, windowType);
  const real = new Float64Array(nFft);
  const imag = new Float64Array(nFft);

  const len = Math.min(signal.length, nFft);
  for (let i = 0; i < len; i++) {
    real[i] = signal[i] * win[i];
  }

  fftRadix2(real, imag, false);

  const numBins = nFft / 2;
  const magnitudes = new Float32Array(numBins);
  const magnitudesDb = new Float32Array(numBins);

  for (let i = 0; i < numBins; i++) {
    const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / (nFft / 2);
    magnitudes[i] = mag;
    magnitudesDb[i] = 20 * Math.log10(Math.max(1e-6, mag));
  }

  return { magnitudes, magnitudesDb };
}

// ==========================================
// 6. Time-Frequency STFT & Spectrogram
// ==========================================

export function computeStft(
  signal: Float32Array,
  sampleRate: number,
  nFft: number = 512,
  hopSize: number = 256,
  windowType: WindowFunction = 'hann'
): StftResult {
  const win = getWindowCoefficients(nFft, windowType);
  const numFrames = Math.max(1, Math.floor((signal.length - nFft) / hopSize) + 1);
  const numBins = nFft / 2;

  const spectrogram: Float32Array[] = [];
  const times: number[] = [];
  const frequencies: number[] = [];

  for (let i = 0; i < numBins; i++) {
    frequencies.push((i * sampleRate) / nFft);
  }

  const real = new Float64Array(nFft);
  const imag = new Float64Array(nFft);

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    real.fill(0);
    imag.fill(0);

    for (let i = 0; i < nFft; i++) {
      if (start + i < signal.length) {
        real[i] = signal[start + i] * win[i];
      }
    }

    fftRadix2(real, imag, false);

    const frameMagsDb = new Float32Array(numBins);
    for (let b = 0; b < numBins; b++) {
      const mag = Math.sqrt(real[b] * real[b] + imag[b] * imag[b]) / (nFft / 2);
      frameMagsDb[b] = 20 * Math.log10(Math.max(1e-5, mag));
    }

    spectrogram.push(frameMagsDb);
    times.push((start + nFft / 2) / sampleRate);
  }

  return {
    spectrogram,
    times,
    frequencies,
    sampleRate,
    nFft,
    hopSize,
  };
}

// ==========================================
// 7. Digital Audio Filters (FIR & Biquad IIR)
// ==========================================

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

/**
 * Compute FIR Sinc Filter Kernel with Hann Window
 */
export function designFirFilter(
  type: FilterType,
  cutoffFreq: number,
  sampleRate: number,
  numTaps: number = 65,
  bandwidth: number = 400
): Float32Array {
  // numTaps must be odd for symmetric linear phase
  const m = numTaps % 2 === 0 ? numTaps + 1 : numTaps;
  const h = new Float32Array(m);
  const halfM = (m - 1) / 2;
  const fc = cutoffFreq / sampleRate;
  const bw = bandwidth / sampleRate;

  const win = getWindowCoefficients(m, 'hann');

  for (let i = 0; i < m; i++) {
    const n = i - halfM;
    if (n === 0) {
      if (type === 'lowpass') h[i] = 2 * Math.PI * fc;
      else if (type === 'highpass') h[i] = 1.0 - 2 * Math.PI * fc;
      else if (type === 'bandpass') h[i] = 2 * Math.PI * bw;
      else if (type === 'notch') h[i] = 1.0 - 2 * Math.PI * bw;
    } else {
      if (type === 'lowpass') {
        h[i] = Math.sin(2 * Math.PI * fc * n) / n;
      } else if (type === 'highpass') {
        h[i] = -Math.sin(2 * Math.PI * fc * n) / n;
      } else if (type === 'bandpass') {
        const f1 = fc - bw / 2;
        const f2 = fc + bw / 2;
        h[i] = (Math.sin(2 * Math.PI * f2 * n) - Math.sin(2 * Math.PI * f1 * n)) / n;
      } else if (type === 'notch') {
        const f1 = fc - bw / 2;
        const f2 = fc + bw / 2;
        h[i] = -(Math.sin(2 * Math.PI * f2 * n) - Math.sin(2 * Math.PI * f1 * n)) / n;
      }
    }
    h[i] *= win[i];
  }

  // Normalize DC or Center gain
  let sum = 0;
  for (let i = 0; i < m; i++) sum += h[i];
  if (Math.abs(sum) > 1e-6 && type === 'lowpass') {
    for (let i = 0; i < m; i++) h[i] /= sum;
  }

  return h;
}

/**
 * Apply 1D Convolution (FIR Filter)
 */
export function applyFirFilter(signal: Float32Array, kernel: Float32Array): Float32Array {
  const n = signal.length;
  const m = kernel.length;
  const output = new Float32Array(n);
  const half = Math.floor(m / 2);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < m; k++) {
      const idx = i - k + half;
      if (idx >= 0 && idx < n) {
        sum += signal[idx] * kernel[k];
      }
    }
    output[i] = sum;
  }
  return output;
}

/**
 * Apply 2nd Order Biquad IIR Filter
 */
export function applyBiquadFilter(
  signal: Float32Array,
  type: FilterType,
  cutoffFreq: number,
  sampleRate: number,
  q: number = 0.7071
): Float32Array {
  const w0 = (2 * Math.PI * cutoffFreq) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cosW0 = Math.cos(w0);

  let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  switch (type) {
    case 'lowpass':
      b0 = (1 - cosW0) / 2;
      b1 = 1 - cosW0;
      b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case 'highpass':
      b0 = (1 + cosW0) / 2;
      b1 = -(1 + cosW0);
      b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case 'bandpass':
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case 'notch':
      b0 = 1;
      b1 = -2 * cosW0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
  }

  // Normalize by a0
  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  const output = new Float32Array(signal.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < signal.length; i++) {
    const x0 = signal[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    output[i] = y0;

    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }

  return output;
}

// ==========================================
// 8. Audio Feature Extraction
// ==========================================

export function computeAudioFeatures(signal: Float32Array, sampleRate: number): AudioFeatures {
  const n = signal.length;
  if (n === 0) {
    return {
      rmsEnergy: 0,
      zeroCrossingRate: 0,
      spectralCentroid: 0,
      spectralSpread: 0,
      spectralFlatness: 0,
      spectralRolloff: 0,
    };
  }

  // 1. RMS Energy
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += signal[i] * signal[i];
  const rmsEnergy = Math.sqrt(sumSq / n);

  // 2. Zero Crossing Rate (ZCR)
  let zcrCount = 0;
  for (let i = 1; i < n; i++) {
    if ((signal[i] >= 0 && signal[i - 1] < 0) || (signal[i] < 0 && signal[i - 1] >= 0)) {
      zcrCount++;
    }
  }
  const zeroCrossingRate = zcrCount / (n - 1);

  // 3. Spectral Features via FFT
  const nFft = 1024;
  const { magnitudes } = computeMagnitudeSpectrum(signal.slice(0, Math.min(n, nFft)), 'hann', nFft);
  const numBins = magnitudes.length;

  let magSum = 0;
  let weightedFreqSum = 0;
  let logMagSum = 0;

  for (let b = 0; b < numBins; b++) {
    const freq = (b * sampleRate) / nFft;
    const mag = magnitudes[b];
    magSum += mag;
    weightedFreqSum += freq * mag;
    logMagSum += Math.log(Math.max(1e-8, mag));
  }

  const spectralCentroid = magSum > 1e-7 ? weightedFreqSum / magSum : 0;

  // Spectral Spread (standard deviation around centroid)
  let spreadSum = 0;
  for (let b = 0; b < numBins; b++) {
    const freq = (b * sampleRate) / nFft;
    const diff = freq - spectralCentroid;
    spreadSum += diff * diff * magnitudes[b];
  }
  const spectralSpread = magSum > 1e-7 ? Math.sqrt(spreadSum / magSum) : 0;

  // Spectral Flatness (Geometric Mean / Arithmetic Mean)
  const arithmeticMean = magSum / numBins;
  const geometricMean = Math.exp(logMagSum / numBins);
  const spectralFlatness = arithmeticMean > 1e-7 ? geometricMean / arithmeticMean : 0;

  // Spectral Rolloff (Frequency below which 85% of magnitude resides)
  const rolloffThreshold = 0.85 * magSum;
  let cumSum = 0;
  let spectralRolloff = 0;
  for (let b = 0; b < numBins; b++) {
    cumSum += magnitudes[b];
    if (cumSum >= rolloffThreshold) {
      spectralRolloff = (b * sampleRate) / nFft;
      break;
    }
  }

  return {
    rmsEnergy,
    zeroCrossingRate,
    spectralCentroid,
    spectralSpread,
    spectralFlatness,
    spectralRolloff,
  };
}

/**
 * Simple Mel-scale filterbank (13-coefficient approximation for educational lab)
 */
export function computeMfcc13(signal: Float32Array, sampleRate: number): Float32Array {
  const nFft = 1024;
  const numFilters = 20;
  const numCoeffs = 13;
  const { magnitudes } = computeMagnitudeSpectrum(signal.slice(0, Math.min(signal.length, nFft)), 'hann', nFft);

  // Convert Hz to Mel: m = 2595 * log10(1 + f/700)
  const hzToMel = (f: number) => 2595 * Math.log10(1 + f / 700);
  const melToHz = (m: number) => 700 * (Math.pow(10, m / 2595) - 1);

  const minMel = hzToMel(100);
  const maxMel = hzToMel(sampleRate / 2);
  const melPoints = new Float32Array(numFilters + 2);

  for (let i = 0; i <= numFilters + 1; i++) {
    melPoints[i] = minMel + (i * (maxMel - minMel)) / (numFilters + 1);
  }

  const binPoints = new Int32Array(numFilters + 2);
  for (let i = 0; i <= numFilters + 1; i++) {
    const hz = melToHz(melPoints[i]);
    binPoints[i] = Math.floor(((nFft + 1) * hz) / sampleRate);
  }

  // Filterbank energies
  const energies = new Float32Array(numFilters);
  for (let m = 1; m <= numFilters; m++) {
    let energy = 0;
    for (let k = binPoints[m - 1]; k < binPoints[m]; k++) {
      if (k < magnitudes.length) {
        const weight = (k - binPoints[m - 1]) / (binPoints[m] - binPoints[m - 1] || 1);
        energy += magnitudes[k] * weight;
      }
    }
    for (let k = binPoints[m]; k < binPoints[m + 1]; k++) {
      if (k < magnitudes.length) {
        const weight = (binPoints[m + 1] - k) / (binPoints[m + 1] - binPoints[m] || 1);
        energy += magnitudes[k] * weight;
      }
    }
    energies[m - 1] = Math.log(Math.max(1e-6, energy));
  }

  // DCT Type-II to produce MFCCs
  const mfcc = new Float32Array(numCoeffs);
  for (let i = 0; i < numCoeffs; i++) {
    let sum = 0;
    for (let j = 0; j < numFilters; j++) {
      sum += energies[j] * Math.cos((Math.PI * i * (j + 0.5)) / numFilters);
    }
    mfcc[i] = sum;
  }

  return mfcc;
}

// ==========================================
// 9. Speech Processing (VAD & Pitch via Autocorrelation)
// ==========================================

/**
 * Autocorrelation based fundamental frequency (pitch / F0) estimation
 */
export function estimatePitchAutocorr(
  frame: Float32Array,
  sampleRate: number,
  minFreq: number = 75,
  maxFreq: number = 400
): { pitchHz: number; confidence: number } {
  const n = frame.length;
  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.floor(sampleRate / minFreq);

  let energy = 0;
  for (let i = 0; i < n; i++) energy += frame[i] * frame[i];
  if (energy < 1e-4) return { pitchHz: 0, confidence: 0 };

  let maxCorr = -1;
  let bestLag = -1;

  for (let lag = minLag; lag <= Math.min(maxLag, n - 1); lag++) {
    let corr = 0;
    for (let i = 0; i < n - lag; i++) {
      corr += frame[i] * frame[i + lag];
    }
    corr /= energy; // Normalized autocorrelation

    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag > 0 && maxCorr > 0.3) {
    const pitchHz = sampleRate / bestLag;
    return { pitchHz, confidence: Math.max(0, Math.min(1.0, maxCorr)) };
  }

  return { pitchHz: 0, confidence: 0 };
}

/**
 * Simple Frame-based Voice Activity Detection (VAD) via Energy & ZCR
 */
export function computeVad(
  signal: Float32Array,
  sampleRate: number,
  frameSizeMs: number = 30,
  energyThreshold: number = 0.015,
  zcrThreshold: number = 0.4
): VadSegment[] {
  const frameLength = Math.floor((sampleRate * frameSizeMs) / 1000);
  const hopSize = Math.floor(frameLength / 2);
  const numFrames = Math.max(1, Math.floor((signal.length - frameLength) / hopSize) + 1);

  const segments: VadSegment[] = [];

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    const frame = signal.slice(start, start + frameLength);

    // RMS
    let sumSq = 0;
    let zcrCount = 0;
    for (let i = 0; i < frame.length; i++) {
      sumSq += frame[i] * frame[i];
      if (i > 0 && ((frame[i] >= 0 && frame[i - 1] < 0) || (frame[i] < 0 && frame[i - 1] >= 0))) {
        zcrCount++;
      }
    }
    const rms = Math.sqrt(sumSq / frame.length);
    const zcr = zcrCount / (frame.length - 1);

    // Speech typically has higher energy and moderate ZCR compared to unvoiced noise
    const isSpeech = rms >= energyThreshold && zcr <= zcrThreshold;
    const startSec = start / sampleRate;
    const endSec = (start + frameLength) / sampleRate;

    // Merge or push segment
    if (segments.length > 0 && segments[segments.length - 1].isSpeech === isSpeech) {
      segments[segments.length - 1].endSec = endSec;
    } else {
      segments.push({ startSec, endSec, isSpeech });
    }
  }

  return segments;
}

// ==========================================
// 10. Speech Evaluation Metrics (WER & CER)
// ==========================================

/**
 * Word Error Rate (WER) using Levenshtein distance on words
 */
export function calculateWer(reference: string, hypothesis: string): {
  wer: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  wordCount: number;
} {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

  const refWords = clean(reference);
  const hypWords = clean(hypothesis);

  const n = refWords.length;
  const m = hypWords.length;

  if (n === 0) {
    return {
      wer: m > 0 ? 1.0 : 0.0,
      substitutions: 0,
      deletions: 0,
      insertions: m,
      wordCount: 0,
    };
  }

  // DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const sub = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        dp[i][j] = Math.min(sub, del, ins);
      }
    }
  }

  // Backtracking for exact S, D, I counts
  let i = n;
  let j = m;
  let S = 0, D = 0, I = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refWords[i - 1] === hypWords[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      S++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      D++;
      i--;
    } else {
      I++;
      j--;
    }
  }

  const wer = (S + D + I) / n;
  return { wer, substitutions: S, deletions: D, insertions: I, wordCount: n };
}

