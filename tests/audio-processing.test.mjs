import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSyntheticAudio,
  quantizeAudio,
  calculateSqnr,
  getWindowCoefficients,
  fftRadix2,
  computeMagnitudeSpectrum,
  computeStft,
  designFirFilter,
  applyFirFilter,
  applyBiquadFilter,
  computeAudioFeatures,
  estimatePitchAutocorr,
  computeVad,
  calculateWer,
  createWavBlob,
} from '../src/lib/audioProcessing.ts';

test('Audio Synthesis: Sine and Square waves generate valid ranges', () => {
  const sine = generateSyntheticAudio('sine', 440, 0.1, 44100, 0.8);
  assert.equal(sine.length, 4410);
  assert.ok(Math.max(...sine) <= 0.81);
  assert.ok(Math.min(...sine) >= -0.81);

  const square = generateSyntheticAudio('square', 200, 0.05, 44100, 1.0);
  assert.equal(square.length, 2205);
  assert.ok(square.some(v => Math.abs(v - 1.0) < 1e-4));
  assert.ok(square.some(v => Math.abs(v - (-1.0)) < 1e-4));
});

test('Quantization & SQNR: Higher bit depth results in higher SQNR', () => {
  const signal = generateSyntheticAudio('sine', 440, 0.1, 44100, 0.9);
  const q4 = quantizeAudio(signal, 4);
  const q8 = quantizeAudio(signal, 8);
  const q16 = quantizeAudio(signal, 16);

  const sqnr4 = calculateSqnr(signal, q4);
  const sqnr8 = calculateSqnr(signal, q8);
  const sqnr16 = calculateSqnr(signal, q16);

  assert.ok(sqnr4 < sqnr8, `SQNR 4-bit (${sqnr4}) must be lower than 8-bit (${sqnr8})`);
  assert.ok(sqnr8 < sqnr16, `SQNR 8-bit (${sqnr8}) must be lower than 16-bit (${sqnr16})`);
  assert.ok(sqnr16 > 70, `16-bit SQNR should be > 70 dB (got ${sqnr16})`);
});

test('1D Radix-2 FFT: 1D Forward & Inverse FFT reconstructs original signal', () => {
  const n = 64;
  const original = new Float64Array(n);
  const imag = new Float64Array(n);
  for (let i = 0; i < n; i++) original[i] = Math.sin((2 * Math.PI * 4 * i) / n);

  const realCopy = new Float64Array(original);
  fftRadix2(realCopy, imag, false);

  // Peak should be at bin 4 and bin 60 (conjugate symmetry)
  const mag4 = Math.sqrt(realCopy[4] ** 2 + imag[4] ** 2);
  const mag0 = Math.sqrt(realCopy[0] ** 2 + imag[0] ** 2);
  assert.ok(mag4 > mag0 * 10, 'Peak at bin 4 should dominate');

  // IFFT
  fftRadix2(realCopy, imag, true);
  for (let i = 0; i < n; i++) {
    assert.ok(Math.abs(realCopy[i] - original[i]) < 1e-5, `Mismatch at sample ${i}`);
  }
});

test('Digital Filters: FIR and Biquad LPF attenuates high frequency sine wave', () => {
  const sampleRate = 8000;
  // High frequency 3000 Hz sine
  const highFreq = generateSyntheticAudio('sine', 3000, 0.05, sampleRate, 1.0);
  
  // FIR LPF with cutoff 1000 Hz
  const firKernel = designFirFilter('lowpass', 1000, sampleRate, 31);
  const firFiltered = applyFirFilter(highFreq, firKernel);
  
  // Biquad LPF with cutoff 1000 Hz
  const biquadFiltered = applyBiquadFilter(highFreq, 'lowpass', 1000, sampleRate);

  // High frequency power should be significantly reduced
  const origPower = highFreq.reduce((acc, v) => acc + v * v, 0) / highFreq.length;
  const firPower = firFiltered.reduce((acc, v) => acc + v * v, 0) / firFiltered.length;
  const biquadPower = biquadFiltered.reduce((acc, v) => acc + v * v, 0) / biquadFiltered.length;

  assert.ok(firPower < origPower * 0.1, `FIR LPF should attenuate 3kHz (orig: ${origPower}, fir: ${firPower})`);
  assert.ok(biquadPower < origPower * 0.1, `Biquad LPF should attenuate 3kHz (orig: ${origPower}, biquad: ${biquadPower})`);
});

test('Audio Features: RMS and Spectral Centroid distinguish sine 200 Hz vs 2000 Hz', () => {
  const sampleRate = 16000;
  const lowTone = generateSyntheticAudio('sine', 200, 0.1, sampleRate, 0.5);
  const highTone = generateSyntheticAudio('sine', 2000, 0.1, sampleRate, 0.5);

  const lowFeats = computeAudioFeatures(lowTone, sampleRate);
  const highFeats = computeAudioFeatures(highTone, sampleRate);

  assert.ok(Math.abs(lowFeats.rmsEnergy - highFeats.rmsEnergy) < 0.05, 'RMS should be similar');
  assert.ok(lowFeats.spectralCentroid < highFeats.spectralCentroid, 'Spectral centroid of 200Hz < 2000Hz');
  assert.ok(Math.abs(lowFeats.spectralCentroid - 200) < 100, `Centroid 200Hz close to 200 (got ${lowFeats.spectralCentroid})`);
});

test('Speech Processing: Autocorrelation pitch estimation recovers 150 Hz voice fundamental', () => {
  const sampleRate = 16000;
  const pitchSignal = generateSyntheticAudio('harmonic', 150, 0.1, sampleRate, 0.8);
  const { pitchHz, confidence } = estimatePitchAutocorr(pitchSignal, sampleRate);

  assert.ok(confidence > 0.6, `Pitch estimation confidence should be > 0.6 (got ${confidence})`);
  assert.ok(Math.abs(pitchHz - 150) < 10, `Pitch should be near 150 Hz (got ${pitchHz})`);
});

test('WER Calculation: Levenshtein distance handles substitutions, deletions, insertions', () => {
  const ref = 'teknologi multimedia dan computer vision indonesia';
  const hyp = 'teknologi multimedia dan visi komputer indonesia hebat';

  const res = calculateWer(ref, hyp);
  assert.equal(res.wordCount, 6);
  assert.ok(res.wer > 0, 'WER should be non-zero for mismatched text');
  
  // Exact match
  const exact = calculateWer(ref, ref);
  assert.equal(exact.wer, 0.0);
  assert.equal(exact.substitutions, 0);
  assert.equal(exact.deletions, 0);
  assert.equal(exact.insertions, 0);
});

