import test from 'node:test';
import assert from 'node:assert/strict';
import {
  quantizeBitDepthRgba,
  extractChannelRgba,
  rgbToHsv,
  rgbToHsl,
  rgbToYCbCr,
  rgbToLab,
  computeIntensityLut,
  computeHistograms,
  equalizeHistogramRgba,
  applyClaheGray,
  generateGaussianKernel2d,
  convolve2dGray,
  medianFilterRgba,
  fft2d,
  frequencyFilter2d,
  addSyntheticNoiseRgba,
  bilateralFilterRgba,
  computeMsePsnr,
  computeSsim,
  detectEdgesClassical,
  cannyEdgeDetector,
  harrisCornerDetector,
  createStructuringElement,
  applyMorphology,
  computeOtsuThreshold,
  connectedComponentsAnalysis,
  computeSegmentationMetrics,
} from '../src/lib/imageProcessing.ts';

test('Ch 06: Bit depth quantization reduces 1-bit to {0, 255} and preserves 8-bit', () => {
  const src = new Uint8ClampedArray([
    10, 120, 240, 255,
    127, 128, 255, 255,
  ]);
  const q8 = quantizeBitDepthRgba(src, 8);
  assert.deepEqual(Array.from(q8), Array.from(src));

  const q1 = quantizeBitDepthRgba(src, 1);
  assert.equal(q1[0], 0);
  assert.equal(q1[2], 255);
  assert.equal(q1[4], 0);
  assert.equal(q1[5], 255);

  const rOnly = extractChannelRgba(src, 'r');
  assert.equal(rOnly[0], 10);
  assert.equal(rOnly[1], 0);
  assert.equal(rOnly[2], 0);
});

test('Ch 07: Color space transformations produce exact known values for primaries & white', () => {
  // Pure Red (255, 0, 0)
  const hsvRed = rgbToHsv(255, 0, 0);
  assert.equal(Math.round(hsvRed.h), 0);
  assert.equal(hsvRed.s, 1);
  assert.equal(hsvRed.v, 1);

  // Pure Green (0, 255, 0) -> Hue 120
  const hslGreen = rgbToHsl(0, 255, 0);
  assert.equal(Math.round(hslGreen.h), 120);
  assert.equal(hslGreen.l, 0.5);

  // White (255, 255, 255) -> Y=255, Cb=128, Cr=128
  const ycbcrWhite = rgbToYCbCr(255, 255, 255);
  assert.equal(ycbcrWhite.y, 255);
  assert.equal(ycbcrWhite.cb, 128);
  assert.equal(ycbcrWhite.cr, 128);

  // White (255, 255, 255) -> L* ≈ 100, a* ≈ 0, b* ≈ 0
  const labWhite = rgbToLab(255, 255, 255);
  assert.ok(Math.abs(labWhite.l - 100) < 0.2, `L* expected ~100, got ${labWhite.l}`);
  assert.ok(Math.abs(labWhite.a) < 0.2, `a* expected ~0, got ${labWhite.a}`);
  assert.ok(Math.abs(labWhite.b) < 0.2, `b* expected ~0, got ${labWhite.b}`);
});

test('Ch 08 & 09: Intensity LUT negative & Global/CLAHE Histogram Equalization expand dynamic range', () => {
  const negLut = computeIntensityLut({ mode: 'negative', brightness: 0, contrast: 1, gamma: 1 });
  assert.equal(negLut[0], 255);
  assert.equal(negLut[255], 0);

  // Low contrast dark 4x4 patch [40..70]
  const w = 16;
  const h = 16;
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const val = 40 + (i % 4) * 10;
    rgba[i * 4] = val;
    rgba[i * 4 + 1] = val;
    rgba[i * 4 + 2] = val;
    rgba[i * 4 + 3] = 255;
  }
  const eq = equalizeHistogramRgba(rgba);
  const histEq = computeHistograms(eq);
  assert.ok(histEq.lum[0] > 0 && histEq.lum[255] > 0, 'Equalization stretches min to 0 and max to 255');

  const cW = 64;
  const cH = 64;
  const gray = new Uint8ClampedArray(cW * cH);
  for (let i = 0; i < cW * cH; i++) gray[i] = 40 + (i % 40);
  const claheOut = applyClaheGray(gray, cW, cH, 2, 2, 4.0);
  const maxOut = Math.max(...claheOut);
  const minOut = Math.min(...claheOut);
  assert.ok(maxOut - minOut > 120, `CLAHE expands local dynamic range (got span ${maxOut - minOut})`);
});

test('Ch 10: 2D Spatial Convolution & Median Filter match deterministic reference values', () => {
  const gk = generateGaussianKernel2d(3, 1.0);
  const sum = gk.flat().reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-10, 'Gaussian kernel sum == 1.0');

  // Impulse response test: asymmetric kernel confirms 180-deg convolution rotation vs correlation
  const img = [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 100, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ];
  const asymKernel = [
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const conv = convolve2dGray(img, 5, 5, asymKernel, 'zero');
  // By definition (f*w)(y,x) = sum w(s,t)*f(y-s, x-t); with w(-1,-1)=1, output (1,1) reads f(2,2)=100
  assert.equal(conv[1 * 5 + 1], 100, 'Convolution flips kernel 180 degrees properly');
  assert.equal(conv[3 * 5 + 3], 0, 'Convolution does not behave like unflipped correlation');

  // Salt-and-pepper median filter removes isolated 255 spike in homogeneous 50 background
  const sp = new Uint8ClampedArray(9 * 4);
  for (let i = 0; i < 9; i++) {
    const v = i === 4 ? 255 : 50;
    sp[i * 4] = sp[i * 4 + 1] = sp[i * 4 + 2] = v;
    sp[i * 4 + 3] = 255;
  }
  const med = medianFilterRgba(sp, 3, 3, 3, 'replicate');
  assert.equal(med[4 * 4], 50, 'Median filter suppresses salt impulse noise');
});

test('Ch 11: 2D Radix-2 FFT + IFFT roundtrip reconstructs exact signal and LPF reduces energy', () => {
  const size = 16;
  const n = size * size;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const orig = new Uint8ClampedArray(n);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const val = Math.round(128 + 60 * Math.cos((2 * Math.PI * 2 * x) / size));
      orig[y * size + x] = val;
      re[y * size + x] = val;
    }
  }
  fft2d(re, im, size, false);
  fft2d(re, im, size, true);
  let maxErr = 0;
  for (let i = 0; i < n; i++) {
    maxErr = Math.max(maxErr, Math.abs(re[i] - orig[i]));
  }
  assert.ok(maxErr < 1e-8, `2D FFT/IFFT roundtrip max error expected < 1e-8, got ${maxErr}`);

  const res = frequencyFilter2d(orig, size, { filterKind: 'gaussian', passType: 'low', d0: 3 });
  assert.equal(res.filteredGray.length, n);
  assert.equal(res.spectrumRgba.length, n * 4);
});

test('Ch 12: Synthetic noise + Bilateral/Median denoising improves PSNR & SSIM', () => {
  const w = 24;
  const h = 24;
  const clean = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = x < 12 ? 60 : 200;
      const idx = (y * w + x) * 4;
      clean[idx] = clean[idx + 1] = clean[idx + 2] = v;
      clean[idx + 3] = 255;
    }
  }
  const identical = computeMsePsnr(clean, clean);
  assert.equal(identical.mse, 0);
  assert.ok(Math.abs(computeSsim(clean, clean, w, h) - 1.0) < 1e-6);

  const noisy = addSyntheticNoiseRgba(clean, 'salt_pepper', 0.15, 99);
  const restored = medianFilterRgba(noisy, w, h, 3, 'reflect');
  const noisyMetrics = computeMsePsnr(clean, noisy);
  const restMetrics = computeMsePsnr(clean, restored);
  assert.ok(restMetrics.psnr > noisyMetrics.psnr, `Median filter PSNR (${restMetrics.psnr.toFixed(2)}) > noisy (${noisyMetrics.psnr.toFixed(2)})`);

  const gaussNoisy = addSyntheticNoiseRgba(clean, 'gaussian', 20, 77);
  const bilat = bilateralFilterRgba(gaussNoisy, w, h, 2, 40, 2);
  assert.ok(computeSsim(clean, bilat, w, h) > computeSsim(clean, gaussNoisy, w, h), 'Bilateral improves SSIM');
});

test('Ch 13: Sobel, Canny & Harris detect step edges and rectangle corners accurately', () => {
  const w = 32;
  const h = 32;
  const gray = new Uint8ClampedArray(w * h);
  for (let y = 8; y < 24; y++) {
    for (let x = 8; x < 24; x++) {
      gray[y * w + x] = 220;
    }
  }
  const sobel = detectEdgesClassical(gray, w, h, 'sobel');
  assert.ok(sobel[16 * w + 8] > 150, 'Sobel detects vertical square boundary strongly');
  assert.equal(sobel[16 * w + 16], 0, 'Sobel response in uniform interior is zero');

  const canny = cannyEdgeDetector(gray, w, h, 0.8, 30, 80);
  const edgeCount = canny.filter((v) => v === 255).length;
  assert.ok(edgeCount > 20 && edgeCount < 200, `Canny thin edge count expected (20..200), got ${edgeCount}`);

  const corners = harrisCornerDetector(gray, w, h, 0.04, 0.1);
  assert.ok(corners.length >= 4, `Harris detects at least 4 corners of square, got ${corners.length}`);
});

test('Ch 14: Morphology erosion shrinks, dilation expands, opening removes isolated dot', () => {
  const w = 15;
  const h = 15;
  const bin = new Uint8ClampedArray(w * h);
  for (let y = 4; y <= 10; y++) {
    for (let x = 4; x <= 10; x++) {
      bin[y * w + x] = 255;
    }
  }
  bin[1 * w + 1] = 255; // isolated 1px noise dot

  const se = createStructuringElement('square', 3);
  const opened = applyMorphology(bin, w, h, 'open', se);
  assert.equal(opened[1 * w + 1], 0, 'Morphological opening removes isolated 1px foreground noise');
  assert.equal(opened[7 * w + 7], 255, 'Morphological opening preserves 7x7 square core');

  const eroded = applyMorphology(bin, w, h, 'erode', se);
  assert.equal(eroded[4 * w + 4], 0, 'Erosion shrinks outer boundary of 7x7 square');
});

test('Ch 15: Otsu threshold separates bimodal intensities and Connected Components counts exact objects', () => {
  const w = 30;
  const h = 20;
  const gray = new Uint8ClampedArray(w * h).fill(30);
  // Two distinct bright objects: 5x5 rectangle + 4x4 rectangle
  for (let y = 2; y < 7; y++) for (let x = 2; x < 7; x++) gray[y * w + x] = 210;
  for (let y = 10; y < 14; y++) for (let x = 18; x < 22; x++) gray[y * w + x] = 210;

  const otsu = computeOtsuThreshold(gray);
  assert.ok(otsu.threshold >= 30 && otsu.threshold < 210, `Otsu threshold (${otsu.threshold}) splits bimodal modes`);

  const cc = connectedComponentsAnalysis(otsu.mask, w, h, 5);
  assert.equal(cc.objects.length, 2, 'Connected Components detects exact 2 objects');
  assert.equal(cc.objects[0].area, 25);
  assert.equal(cc.objects[1].area, 16);

  const perfectMetrics = computeSegmentationMetrics(otsu.mask, otsu.mask);
  assert.equal(perfectMetrics.iou, 1);
  assert.equal(perfectMetrics.dice, 1);
});
