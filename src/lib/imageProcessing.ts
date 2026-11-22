/**
 * Multimedia & Computer Vision Learning Hub
 * Shared Client-Side & Testable Digital Image Processing Engine (Chapters 06-15)
 * Author: Aji Pamungkas Tri Nurcahyo (ITERA)
 */

export type BorderMode = 'reflect' | 'replicate' | 'zero';
export type FilterKernelMode = 'gaussian' | 'box' | 'median' | 'sharpen' | 'sobel' | 'grayscale';
export type ColorSpaceMode = 'rgb' | 'grayscale' | 'hsv' | 'hsl' | 'ycbcr' | 'lab';
export type IntensityMode = 'bc_gamma' | 'negative' | 'log' | 'contrast_stretch';
export type HistogramMode = 'original' | 'equalize' | 'stretch' | 'clahe';
export type NoiseType = 'gaussian' | 'salt_pepper' | 'speckle';
export type DenoiseMethod = 'none' | 'mean' | 'median' | 'bilateral' | 'nlm' | 'wiener';
export type EdgeOperator = 'sobel' | 'prewitt' | 'laplacian' | 'canny' | 'harris';
export type MorphShape = 'square' | 'cross' | 'disk';
export type MorphOp = 'erode' | 'dilate' | 'open' | 'close' | 'gradient' | 'tophat' | 'blackhat';
export type SegmentMethod = 'global' | 'adaptive' | 'otsu';

export interface DetectedCorner {
  x: number;
  y: number;
  response: number;
}

export interface SegmentedObjectStats {
  id: number;
  area: number;
  cx: number;
  cy: number;
  bbox: { x: number; y: number; w: number; h: number };
  perimeter: number;
  circularity: number;
}

export function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Deterministic Park-Miller PRNG for reproducible tests and synthetic noise. */
export function createSeededRng(seed = 42): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function boxMullerNormal(rng: () => number): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

export function sampleBorderIndex(coord: number, limit: number, mode: BorderMode): number {
  if (coord >= 0 && coord < limit) return coord;
  if (mode === 'zero') return -1;
  if (mode === 'replicate') return coord < 0 ? 0 : limit - 1;
  // Reflect 101-like mirror around edges
  let c = coord;
  if (limit === 1) return 0;
  while (c < 0 || c >= limit) {
    if (c < 0) c = -c;
    if (c >= limit) c = 2 * limit - c - 2;
  }
  return Math.max(0, Math.min(limit - 1, c));
}

export function rgbaToGrayscale(rgba: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    gray[i] = clampByte(0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2]);
  }
  return gray;
}

export function grayToRgba(gray: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const v = gray[i];
    const j = i * 4;
    out[j] = v;
    out[j + 1] = v;
    out[j + 2] = v;
    out[j + 3] = 255;
  }
  return out;
}

// ============================================================================
// Chapter 06 — Image Fundamentals (Bit depth, Channels, Downsampling)
// ============================================================================

export function quantizeBitDepthRgba(rgba: Uint8ClampedArray, bits: number): Uint8ClampedArray {
  const b = Math.max(1, Math.min(8, Math.round(bits)));
  const out = new Uint8ClampedArray(rgba.length);
  if (b === 8) {
    out.set(rgba);
    return out;
  }
  const levels = (1 << b) - 1;
  for (let i = 0; i < rgba.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const q = Math.round((rgba[i + c] / 255) * levels);
      out[i + c] = Math.round((q / levels) * 255);
    }
    out[i + 3] = rgba[i + 3];
  }
  return out;
}

export function extractChannelRgba(
  rgba: Uint8ClampedArray,
  channel: 'rgb' | 'r' | 'g' | 'b' | 'gray'
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    if (channel === 'rgb') {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
    } else if (channel === 'r') {
      out[i] = r;
      out[i + 1] = 0;
      out[i + 2] = 0;
    } else if (channel === 'g') {
      out[i] = 0;
      out[i + 1] = g;
      out[i + 2] = 0;
    } else if (channel === 'b') {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = b;
    } else {
      const y = clampByte(0.299 * r + 0.587 * g + 0.114 * b);
      out[i] = y;
      out[i + 1] = y;
      out[i + 2] = y;
    }
    out[i + 3] = 255;
  }
  return out;
}

export function pixelateDownsampleRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  blockSize: number
): Uint8ClampedArray {
  const step = Math.max(1, Math.round(blockSize));
  const out = new Uint8ClampedArray(rgba.length);
  if (step === 1) {
    out.set(rgba);
    return out;
  }
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const sy = Math.min(h - 1, y + Math.floor(step / 2));
      const sx = Math.min(w - 1, x + Math.floor(step / 2));
      const sIdx = (sy * w + sx) * 4;
      for (let dy = 0; dy < step && y + dy < h; dy++) {
        for (let dx = 0; dx < step && x + dx < w; dx++) {
          const dIdx = ((y + dy) * w + (x + dx)) * 4;
          out[dIdx] = rgba[sIdx];
          out[dIdx + 1] = rgba[sIdx + 1];
          out[dIdx + 2] = rgba[sIdx + 2];
          out[dIdx + 3] = 255;
        }
      }
    }
  }
  return out;
}

// ============================================================================
// Chapter 07 — Color Models & Color Space Transformation
// ============================================================================

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d > 1e-6) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 1e-6) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export function rgbToYCbCr(r: number, g: number, b: number): { y: number; cb: number; cr: number } {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return { y: clampByte(y), cb: clampByte(cb), cr: clampByte(cr) };
}

export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);
  // sRGB to XYZ (D65)
  const x = (0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl) / 0.95047;
  const y = (0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl) / 1.0;
  const z = (0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function decomposeColorSpaceChannels(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  space: ColorSpaceMode
): { ch1: Uint8ClampedArray; ch2: Uint8ClampedArray; ch3: Uint8ClampedArray; labels: [string, string, string] } {
  const n = w * h;
  const ch1 = new Uint8ClampedArray(n * 4);
  const ch2 = new Uint8ClampedArray(n * 4);
  const ch3 = new Uint8ClampedArray(n * 4);

  const setGray = (arr: Uint8ClampedArray, j: number, val: number) => {
    const b = clampByte(val);
    arr[j] = b;
    arr[j + 1] = b;
    arr[j + 2] = b;
    arr[j + 3] = 255;
  };

  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const r = rgba[j];
    const g = rgba[j + 1];
    const b = rgba[j + 2];

    if (space === 'rgb') {
      ch1[j] = r; ch1[j + 3] = 255;
      ch2[j + 1] = g; ch2[j + 3] = 255;
      ch3[j + 2] = b; ch3[j + 3] = 255;
    } else if (space === 'grayscale') {
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      setGray(ch1, j, y);
      setGray(ch2, j, y);
      setGray(ch3, j, y);
    } else if (space === 'hsv') {
      const { h: hh, s, v } = rgbToHsv(r, g, b);
      setGray(ch1, j, (hh / 360) * 255);
      setGray(ch2, j, s * 255);
      setGray(ch3, j, v * 255);
    } else if (space === 'hsl') {
      const { h: hh, s, l } = rgbToHsl(r, g, b);
      setGray(ch1, j, (hh / 360) * 255);
      setGray(ch2, j, s * 255);
      setGray(ch3, j, l * 255);
    } else if (space === 'ycbcr') {
      const { y, cb, cr } = rgbToYCbCr(r, g, b);
      setGray(ch1, j, y);
      setGray(ch2, j, cb);
      setGray(ch3, j, cr);
    } else {
      const lab = rgbToLab(r, g, b);
      setGray(ch1, j, (lab.l / 100) * 255);
      setGray(ch2, j, lab.a + 128);
      setGray(ch3, j, lab.b + 128);
    }
  }

  const labelMap: Record<ColorSpaceMode, [string, string, string]> = {
    rgb: ['Channel R (Red)', 'Channel G (Green)', 'Channel B (Blue)'],
    grayscale: ['Luminance Y (BT.601)', 'Luminance Y', 'Luminance Y'],
    hsv: ['Hue (0-360°)', 'Saturation (0-100%)', 'Value / Brightness'],
    hsl: ['Hue (0-360°)', 'Saturation (0-100%)', 'Lightness'],
    ycbcr: ['Luma Y', 'Chroma Blue (Cb)', 'Chroma Red (Cr)'],
    lab: ['Lightness L*', 'Green–Red Axis a*', 'Blue–Yellow Axis b*'],
  };

  return { ch1, ch2, ch3, labels: labelMap[space] };
}

export function segmentByHsvRange(
  rgba: Uint8ClampedArray,
  targetHueDeg: number,
  toleranceDeg: number,
  minSat = 0.2
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const { h, s, v } = rgbToHsv(rgba[i], rgba[i + 1], rgba[i + 2]);
    let diff = Math.abs(h - targetHueDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff <= toleranceDeg && s >= minSat && v >= 0.1) {
      out[i] = rgba[i];
      out[i + 1] = rgba[i + 1];
      out[i + 2] = rgba[i + 2];
    } else {
      const gray = clampByte((0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]) * 0.25);
      out[i] = gray;
      out[i + 1] = gray;
      out[i + 2] = gray;
    }
    out[i + 3] = 255;
  }
  return out;
}

// ============================================================================
// Chapter 08 — Intensity Transformations
// ============================================================================

export interface IntensityOptions {
  mode: IntensityMode;
  brightness: number; // -100 to +100
  contrast: number; // 0.3 to 2.5
  gamma: number; // 0.2 to 3.0
  lowIn?: number; // 0-120
  highIn?: number; // 135-255
}

export function computeIntensityLut(opts: IntensityOptions): Uint8Array {
  const lut = new Uint8Array(256);
  const low = opts.lowIn ?? 30;
  const high = Math.max(low + 1, opts.highIn ?? 220);
  const logScale = 255 / Math.log(1 + 255);

  for (let r = 0; r < 256; r++) {
    let val = r;
    if (opts.mode === 'negative') {
      val = 255 - r;
    } else if (opts.mode === 'log') {
      val = logScale * Math.log(1 + r);
    } else if (opts.mode === 'contrast_stretch') {
      val = ((r - low) / (high - low)) * 255;
    } else {
      const gCorr = 255 * Math.pow(r / 255, opts.gamma);
      val = opts.contrast * (gCorr - 128) + 128 + opts.brightness;
    }
    lut[r] = clampByte(val);
  }
  return lut;
}

export function applyIntensityTransformRgba(
  rgba: Uint8ClampedArray,
  opts: IntensityOptions
): { output: Uint8ClampedArray; lut: Uint8Array } {
  const lut = computeIntensityLut(opts);
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    out[i] = lut[rgba[i]];
    out[i + 1] = lut[rgba[i + 1]];
    out[i + 2] = lut[rgba[i + 2]];
    out[i + 3] = rgba[i + 3];
  }
  return { output: out, lut };
}

// ============================================================================
// Chapter 09 — Histogram Processing & CLAHE
// ============================================================================

export interface HistogramBundle {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  lum: Uint32Array;
  cdfLum: Float64Array;
}

export function computeHistograms(rgba: Uint8ClampedArray): HistogramBundle {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const lum = new Uint32Array(256);
  const totalPixels = rgba.length / 4;

  for (let i = 0; i < rgba.length; i += 4) {
    r[rgba[i]]++;
    g[rgba[i + 1]]++;
    b[rgba[i + 2]]++;
    const y = clampByte(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
    lum[y]++;
  }

  const cdfLum = new Float64Array(256);
  let acc = 0;
  for (let k = 0; k < 256; k++) {
    acc += lum[k];
    cdfLum[k] = totalPixels > 0 ? acc / totalPixels : 0;
  }

  return { r, g, b, lum, cdfLum };
}

export function equalizeHistogramRgba(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const hist = computeHistograms(rgba);
  let cdfMin = 1;
  for (let k = 0; k < 256; k++) {
    if (hist.lum[k] > 0) {
      cdfMin = hist.cdfLum[k];
      break;
    }
  }
  const lut = new Uint8Array(256);
  const denom = Math.max(1e-8, 1 - cdfMin);
  for (let k = 0; k < 256; k++) {
    lut[k] = clampByte(((hist.cdfLum[k] - cdfMin) / denom) * 255);
  }

  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const yOld = Math.max(1, Math.round(0.299 * r + 0.587 * g + 0.114 * b));
    const yNew = lut[yOld];
    if (r === g && g === b) {
      out[i] = yNew;
      out[i + 1] = yNew;
      out[i + 2] = yNew;
    } else {
      const ratio = yNew / yOld;
      out[i] = clampByte(r * ratio);
      out[i + 1] = clampByte(g * ratio);
      out[i + 2] = clampByte(b * ratio);
    }
    out[i + 3] = 255;
  }
  return out;
}

export function contrastStretchRgba(rgba: Uint8ClampedArray): Uint8ClampedArray {
  let minY = 255;
  let maxY = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const y = clampByte(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = Math.max(1, maxY - minY);
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    out[i] = clampByte(((rgba[i] - minY) / span) * 255);
    out[i + 1] = clampByte(((rgba[i + 1] - minY) / span) * 255);
    out[i + 2] = clampByte(((rgba[i + 2] - minY) / span) * 255);
    out[i + 3] = 255;
  }
  return out;
}

export function applyClaheGray(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  gridX = 4,
  gridY = 4,
  clipLimitFactor = 2.0
): Uint8ClampedArray {
  const tileW = Math.max(8, Math.ceil(w / gridX));
  const tileH = Math.max(8, Math.ceil(h / gridY));
  const cdfs: Uint8Array[][] = [];

  for (let ty = 0; ty < gridY; ty++) {
    cdfs[ty] = [];
    for (let tx = 0; tx < gridX; tx++) {
      const x0 = tx * tileW;
      const y0 = ty * tileH;
      const x1 = Math.min(w, x0 + tileW);
      const y1 = Math.min(h, y0 + tileH);
      const bins = new Float64Array(256);
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          bins[gray[y * w + x]]++;
          count++;
        }
      }
      // Clip & redistribute excess
      const avg = count / 256;
      const clip = Math.max(1, clipLimitFactor * avg);
      let excess = 0;
      for (let k = 0; k < 256; k++) {
        if (bins[k] > clip) {
          excess += bins[k] - clip;
          bins[k] = clip;
        }
      }
      const redist = excess / 256;
      for (let k = 0; k < 256; k++) bins[k] += redist;

      const lut = new Uint8Array(256);
      let cdf = 0;
      let cdfMin = -1;
      for (let k = 0; k < 256; k++) {
        cdf += bins[k];
        if (bins[k] > 0 && cdfMin < 0) cdfMin = cdf;
      }
      cdf = 0;
      const denom = Math.max(1e-6, count - Math.max(0, cdfMin));
      for (let k = 0; k < 256; k++) {
        cdf += bins[k];
        lut[k] = count > 0 ? clampByte(((cdf - Math.max(0, cdfMin)) / denom) * 255) : k;
      }
      cdfs[ty][tx] = lut;
    }
  }

  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    const gy = (y + 0.5) / tileH - 0.5;
    const ty0 = Math.max(0, Math.min(gridY - 1, Math.floor(gy)));
    const ty1 = Math.max(0, Math.min(gridY - 1, ty0 + 1));
    const fy = Math.max(0, Math.min(1, gy - ty0));

    for (let x = 0; x < w; x++) {
      const gx = (x + 0.5) / tileW - 0.5;
      const tx0 = Math.max(0, Math.min(gridX - 1, Math.floor(gx)));
      const tx1 = Math.max(0, Math.min(gridX - 1, tx0 + 1));
      const fx = Math.max(0, Math.min(1, gx - tx0));

      const v = gray[y * w + x];
      const v00 = cdfs[ty0][tx0][v];
      const v10 = cdfs[ty0][tx1][v];
      const v01 = cdfs[ty1][tx0][v];
      const v11 = cdfs[ty1][tx1][v];
      const top = v00 * (1 - fx) + v10 * fx;
      const bot = v01 * (1 - fx) + v11 * fx;
      out[y * w + x] = clampByte(top * (1 - fy) + bot * fy);
    }
  }
  return out;
}

export function applyClaheRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  gridSize = 4,
  clipLimit = 2.5
): Uint8ClampedArray {
  const gray = rgbaToGrayscale(rgba, w, h);
  const claheY = applyClaheGray(gray, w, h, gridSize, gridSize, clipLimit);
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    const yOld = Math.max(1, gray[i]);
    const yNew = claheY[i];
    if (rgba[j] === rgba[j + 1] && rgba[j + 1] === rgba[j + 2]) {
      out[j] = yNew;
      out[j + 1] = yNew;
      out[j + 2] = yNew;
    } else {
      const scale = yNew / yOld;
      out[j] = clampByte(rgba[j] * scale);
      out[j + 1] = clampByte(rgba[j + 1] * scale);
      out[j + 2] = clampByte(rgba[j + 2] * scale);
    }
    out[j + 3] = 255;
  }
  return out;
}

// ============================================================================
// Chapter 10 — Spatial Filtering, Convolution, Median, Border Handling
// ============================================================================

export function generateGaussianKernel2d(ksize: number, sigma: number): number[][] {
  const center = Math.floor(ksize / 2);
  const matrix: number[][] = [];
  let sum = 0;
  for (let y = -center; y <= center; y++) {
    const row: number[] = [];
    for (let x = -center; x <= center; x++) {
      const val = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      row.push(val);
      sum += val;
    }
    matrix.push(row);
  }
  return matrix.map((row) => row.map((val) => val / sum));
}

export function convolve2dGray(
  gray: Uint8ClampedArray | number[],
  w: number,
  h: number,
  kernel: number[][],
  border: BorderMode = 'reflect'
): Uint8ClampedArray {
  const kH = kernel.length;
  const kW = kernel[0].length;
  const halfH = Math.floor(kH / 2);
  const halfW = Math.floor(kW / 2);
  const out = new Uint8ClampedArray(w * h);

  // Rotate kernel 180 deg for strict mathematical convolution
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let ky = 0; ky < kH; ky++) {
        for (let kx = 0; kx < kW; kx++) {
          const sy = sampleBorderIndex(y + (ky - halfH), h, border);
          const sx = sampleBorderIndex(x + (kx - halfW), w, border);
          if (sy >= 0 && sx >= 0) {
            const weight = kernel[kH - 1 - ky][kW - 1 - kx];
            sum += gray[sy * w + sx] * weight;
          }
        }
      }
      out[y * w + x] = clampByte(sum);
    }
  }
  return out;
}

export function convolve2dRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  kernel: number[][],
  border: BorderMode = 'reflect'
): Uint8ClampedArray {
  const kH = kernel.length;
  const kW = kernel[0].length;
  const halfH = Math.floor(kH / 2);
  const halfW = Math.floor(kW / 2);
  const out = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      for (let ky = 0; ky < kH; ky++) {
        for (let kx = 0; kx < kW; kx++) {
          const sy = sampleBorderIndex(y + (ky - halfH), h, border);
          const sx = sampleBorderIndex(x + (kx - halfW), w, border);
          if (sy >= 0 && sx >= 0) {
            const idx = (sy * w + sx) * 4;
            const weight = kernel[kH - 1 - ky][kW - 1 - kx];
            rSum += rgba[idx] * weight;
            gSum += rgba[idx + 1] * weight;
            bSum += rgba[idx + 2] * weight;
          }
        }
      }
      const outIdx = (y * w + x) * 4;
      out[outIdx] = clampByte(rSum);
      out[outIdx + 1] = clampByte(gSum);
      out[outIdx + 2] = clampByte(bSum);
      out[outIdx + 3] = 255;
    }
  }
  return out;
}

export function medianFilterRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  ksize: number,
  border: BorderMode = 'reflect'
): Uint8ClampedArray {
  const half = Math.floor(ksize / 2);
  const out = new Uint8ClampedArray(w * h * 4);
  const winR: number[] = [];
  const winG: number[] = [];
  const winB: number[] = [];
  const mid = Math.floor((ksize * ksize) / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      winR.length = 0;
      winG.length = 0;
      winB.length = 0;
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const sy = sampleBorderIndex(y + ky, h, border);
          const sx = sampleBorderIndex(x + kx, w, border);
          if (sy >= 0 && sx >= 0) {
            const idx = (sy * w + sx) * 4;
            winR.push(rgba[idx]);
            winG.push(rgba[idx + 1]);
            winB.push(rgba[idx + 2]);
          } else {
            winR.push(0);
            winG.push(0);
            winB.push(0);
          }
        }
      }
      winR.sort((a, b) => a - b);
      winG.sort((a, b) => a - b);
      winB.sort((a, b) => a - b);
      const outIdx = (y * w + x) * 4;
      out[outIdx] = winR[mid];
      out[outIdx + 1] = winG[mid];
      out[outIdx + 2] = winB[mid];
      out[outIdx + 3] = 255;
    }
  }
  return out;
}

// ============================================================================
// Chapter 11 — Frequency Domain (2D Radix-2 FFT & Frequency Filters)
// ============================================================================

export function fft1d(re: Float64Array, im: Float64Array, invert: boolean): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? 1 : -1);
    const wlenRe = Math.cos(ang);
    const wlenIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const idx = i + j + len / 2;
        const vRe = re[idx] * wRe - im[idx] * wIm;
        const vIm = re[idx] * wIm + im[idx] * wRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[idx] = uRe - vRe;
        im[idx] = uIm - vIm;
        const nextWRe = wRe * wlenRe - wIm * wlenIm;
        wIm = wRe * wlenIm + wIm * wlenRe;
        wRe = nextWRe;
      }
    }
  }

  if (invert) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

export function fft2d(re: Float64Array, im: Float64Array, size: number, invert: boolean): void {
  const rowRe = new Float64Array(size);
  const rowIm = new Float64Array(size);
  for (let y = 0; y < size; y++) {
    const off = y * size;
    for (let x = 0; x < size; x++) {
      rowRe[x] = re[off + x];
      rowIm[x] = im[off + x];
    }
    fft1d(rowRe, rowIm, invert);
    for (let x = 0; x < size; x++) {
      re[off + x] = rowRe[x];
      im[off + x] = rowIm[x];
    }
  }

  const colRe = new Float64Array(size);
  const colIm = new Float64Array(size);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      colRe[y] = re[y * size + x];
      colIm[y] = im[y * size + x];
    }
    fft1d(colRe, colIm, invert);
    for (let y = 0; y < size; y++) {
      re[y * size + x] = colRe[y];
      im[y * size + x] = colIm[y];
    }
  }
}

export function frequencyFilter2d(
  gray: Uint8ClampedArray,
  size: number,
  opts: {
    filterKind: 'ideal' | 'butterworth' | 'gaussian';
    passType: 'low' | 'high';
    d0: number;
    order?: number;
  }
): {
  filteredGray: Uint8ClampedArray;
  spectrumRgba: Uint8ClampedArray;
  maskRgba: Uint8ClampedArray;
} {
  const n = size * size;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const half = size / 2;

  // Apply (-1)^(x+y) centering pre-shift
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sign = (x + y) % 2 === 0 ? 1 : -1;
      re[y * size + x] = gray[y * size + x] * sign;
    }
  }

  fft2d(re, im, size, false);

  const mask = new Float64Array(n);
  const order = opts.order ?? 2;
  const d0 = Math.max(1, opts.d0);

  for (let v = 0; v < size; v++) {
    for (let u = 0; u < size; u++) {
      const du = u - half;
      const dv = v - half;
      const dist = Math.sqrt(du * du + dv * dv);
      let hVal = 1;
      if (opts.filterKind === 'ideal') {
        hVal = dist <= d0 ? 1 : 0;
      } else if (opts.filterKind === 'gaussian') {
        hVal = Math.exp(-(dist * dist) / (2 * d0 * d0));
      } else {
        hVal = 1 / (1 + Math.pow(dist / d0, 2 * order));
      }
      if (opts.passType === 'high') hVal = 1 - hVal;
      mask[v * size + u] = hVal;
    }
  }

  // Spectrum visualization & apply mask
  const logMag = new Float64Array(n);
  let maxLog = 1e-6;
  for (let i = 0; i < n; i++) {
    re[i] *= mask[i];
    im[i] *= mask[i];
    const lm = Math.log(1 + Math.hypot(re[i], im[i]));
    logMag[i] = lm;
    if (lm > maxLog) maxLog = lm;
  }

  const spectrumRgba = new Uint8ClampedArray(n * 4);
  const maskRgba = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const sv = clampByte((logMag[i] / maxLog) * 255);
    spectrumRgba[j] = sv * 0.4;
    spectrumRgba[j + 1] = sv * 0.9;
    spectrumRgba[j + 2] = sv;
    spectrumRgba[j + 3] = 255;

    const mv = clampByte(mask[i] * 255);
    maskRgba[j] = mv;
    maskRgba[j + 1] = mv;
    maskRgba[j + 2] = mv;
    maskRgba[j + 3] = 255;
  }

  // Inverse FFT + de-center
  fft2d(re, im, size, true);
  const filteredGray = new Uint8ClampedArray(n);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sign = (x + y) % 2 === 0 ? 1 : -1;
      const val = re[y * size + x] * sign;
      filteredGray[y * size + x] = clampByte(opts.passType === 'high' ? Math.abs(val) : val);
    }
  }

  return { filteredGray, spectrumRgba, maskRgba };
}

// ============================================================================
// Chapter 12 — Noise Models, Restoration & PSNR / SSIM Metrics
// ============================================================================

export function addSyntheticNoiseRgba(
  rgba: Uint8ClampedArray,
  type: NoiseType,
  amount: number,
  seed = 123
): Uint8ClampedArray {
  const rng = createSeededRng(seed);
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    if (type === 'gaussian') {
      const nR = boxMullerNormal(rng) * amount;
      const nG = boxMullerNormal(rng) * amount;
      const nB = boxMullerNormal(rng) * amount;
      out[i] = clampByte(rgba[i] + nR);
      out[i + 1] = clampByte(rgba[i + 1] + nG);
      out[i + 2] = clampByte(rgba[i + 2] + nB);
    } else if (type === 'salt_pepper') {
      const p = rng();
      if (p < amount * 0.5) {
        out[i] = out[i + 1] = out[i + 2] = 0;
      } else if (p < amount) {
        out[i] = out[i + 1] = out[i + 2] = 255;
      } else {
        out[i] = rgba[i];
        out[i + 1] = rgba[i + 1];
        out[i + 2] = rgba[i + 2];
      }
    } else {
      // Speckle multiplicative: g = f * (1 + n)
      const factor = 1 + boxMullerNormal(rng) * amount;
      out[i] = clampByte(rgba[i] * factor);
      out[i + 1] = clampByte(rgba[i + 1] * factor);
      out[i + 2] = clampByte(rgba[i + 2] * factor);
    }
    out[i + 3] = 255;
  }
  return out;
}

export function bilateralFilterRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  radius = 2,
  sigmaColor = 35,
  sigmaSpace = 2.0
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  const twoSigS2 = 2 * sigmaSpace * sigmaSpace;
  const twoSigC2 = 2 * sigmaColor * sigmaColor;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cIdx = (y * w + x) * 4;
      const cr = rgba[cIdx];
      const cg = rgba[cIdx + 1];
      const cb = rgba[cIdx + 2];

      let sumW = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sy = sampleBorderIndex(y + dy, h, 'reflect');
          const sx = sampleBorderIndex(x + dx, w, 'reflect');
          const nIdx = (sy * w + sx) * 4;
          const nr = rgba[nIdx];
          const ng = rgba[nIdx + 1];
          const nb = rgba[nIdx + 2];

          const dist2 = dx * dx + dy * dy;
          const color2 = (nr - cr) * (nr - cr) + (ng - cg) * (ng - cg) + (nb - cb) * (nb - cb);
          const weight = Math.exp(-dist2 / twoSigS2 - color2 / (3 * twoSigC2));

          sumW += weight;
          sumR += nr * weight;
          sumG += ng * weight;
          sumB += nb * weight;
        }
      }

      out[cIdx] = clampByte(sumR / sumW);
      out[cIdx + 1] = clampByte(sumG / sumW);
      out[cIdx + 2] = clampByte(sumB / sumW);
      out[cIdx + 3] = 255;
    }
  }
  return out;
}

export function fastNlmRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  searchRadius = 3,
  hParam = 18
): Uint8ClampedArray {
  // Fast 3x3 patch Non-Local Means approximation over search window
  const out = new Uint8ClampedArray(w * h * 4);
  const h2 = hParam * hParam * 9;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sumW = 0;
      let accR = 0;
      let accG = 0;
      let accB = 0;

      for (let sy = -searchRadius; sy <= searchRadius; sy += 1) {
        for (let sx = -searchRadius; sx <= searchRadius; sx += 1) {
          const ny = sampleBorderIndex(y + sy, h, 'reflect');
          const nx = sampleBorderIndex(x + sx, w, 'reflect');

          let patchDist2 = 0;
          for (let py = -1; py <= 1; py++) {
            for (let px = -1; px <= 1; px++) {
              const ay = sampleBorderIndex(y + py, h, 'reflect');
              const ax = sampleBorderIndex(x + px, w, 'reflect');
              const by = sampleBorderIndex(ny + py, h, 'reflect');
              const bx = sampleBorderIndex(nx + px, w, 'reflect');
              const aIdx = (ay * w + ax) * 4;
              const bIdx = (by * w + bx) * 4;
              const dr = rgba[aIdx] - rgba[bIdx];
              const dg = rgba[aIdx + 1] - rgba[bIdx + 1];
              const db = rgba[aIdx + 2] - rgba[bIdx + 2];
              patchDist2 += (dr * dr + dg * dg + db * db) / 3;
            }
          }

          const weight = Math.exp(-Math.max(0, patchDist2) / Math.max(1, h2));
          const nIdx = (ny * w + nx) * 4;
          sumW += weight;
          accR += rgba[nIdx] * weight;
          accG += rgba[nIdx + 1] * weight;
          accB += rgba[nIdx + 2] * weight;
        }
      }

      const cIdx = (y * w + x) * 4;
      out[cIdx] = clampByte(accR / sumW);
      out[cIdx + 1] = clampByte(accG / sumW);
      out[cIdx + 2] = clampByte(accB / sumW);
      out[cIdx + 3] = 255;
    }
  }
  return out;
}

export function wienerDenoiseRgba(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
  noiseVarEst = 400
): Uint8ClampedArray {
  // Adaptive spatial Wiener filter (Lee/MMSE local statistics filter matching classical Wiener restoration)
  const out = new Uint8ClampedArray(w * h * 4);
  const rad = 2;
  const winCount = (2 * rad + 1) * (2 * rad + 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cIdx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let sum2 = 0;
        for (let dy = -rad; dy <= rad; dy++) {
          for (let dx = -rad; dx <= rad; dx++) {
            const sy = sampleBorderIndex(y + dy, h, 'reflect');
            const sx = sampleBorderIndex(x + dx, w, 'reflect');
            const val = rgba[(sy * w + sx) * 4 + c];
            sum += val;
            sum2 += val * val;
          }
        }
        const mean = sum / winCount;
        const localVar = Math.max(0, sum2 / winCount - mean * mean);
        const gain = localVar > noiseVarEst ? (localVar - noiseVarEst) / localVar : 0;
        out[cIdx + c] = clampByte(mean + gain * (rgba[cIdx + c] - mean));
      }
      out[cIdx + 3] = 255;
    }
  }
  return out;
}

export function computeMsePsnr(refRgba: Uint8ClampedArray, testRgba: Uint8ClampedArray): { mse: number; psnr: number } {
  const n = Math.min(refRgba.length, testRgba.length);
  let sumSq = 0;
  let count = 0;
  for (let i = 0; i < n; i += 4) {
    for (let c = 0; c < 3; c++) {
      const d = refRgba[i + c] - testRgba[i + c];
      sumSq += d * d;
      count++;
    }
  }
  const mse = count > 0 ? sumSq / count : 0;
  const psnr = mse === 0 ? 100 : 10 * Math.log10((255 * 255) / mse);
  return { mse, psnr };
}

export function computeSsim(refRgba: Uint8ClampedArray, testRgba: Uint8ClampedArray, w: number, h: number): number {
  const refG = rgbaToGrayscale(refRgba, w, h);
  const testG = rgbaToGrayscale(testRgba, w, h);
  const n = refG.length;
  if (n === 0) return 1;

  let muX = 0;
  let muY = 0;
  for (let i = 0; i < n; i++) {
    muX += refG[i];
    muY += testG[i];
  }
  muX /= n;
  muY /= n;

  let varX = 0;
  let varY = 0;
  let covXY = 0;
  for (let i = 0; i < n; i++) {
    const dx = refG[i] - muX;
    const dy = testG[i] - muY;
    varX += dx * dx;
    varY += dy * dy;
    covXY += dx * dy;
  }
  varX /= n;
  varY /= n;
  covXY /= n;

  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  return ((2 * muX * muY + c1) * (2 * covXY + c2)) / ((muX * muX + muY * muY + c1) * (varX + varY + c2));
}

// ============================================================================
// Chapter 13 — Edge Detection (Sobel, Prewitt, Laplacian, Canny) & Harris
// ============================================================================

export function detectEdgesClassical(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  op: 'sobel' | 'prewitt' | 'laplacian'
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h);
  if (op === 'laplacian') {
    const lapKernel = [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
    ];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const sy = sampleBorderIndex(y + ky, h, 'reflect');
            const sx = sampleBorderIndex(x + kx, w, 'reflect');
            sum += gray[sy * w + sx] * lapKernel[ky + 1][kx + 1];
          }
        }
        out[y * w + x] = clampByte(Math.abs(sum));
      }
    }
    return out;
  }

  const kxMat =
    op === 'sobel'
      ? [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1],
        ]
      : [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1],
        ];
  const kyMat =
    op === 'sobel'
      ? [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1],
        ]
      : [
          [-1, -1, -1],
          [0, 0, 0],
          [1, 1, 1],
        ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let gx = 0;
      let gy = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sy = sampleBorderIndex(y + dy, h, 'reflect');
          const sx = sampleBorderIndex(x + dx, w, 'reflect');
          const v = gray[sy * w + sx];
          gx += v * kxMat[dy + 1][dx + 1];
          gy += v * kyMat[dy + 1][dx + 1];
        }
      }
      out[y * w + x] = clampByte(Math.hypot(gx, gy));
    }
  }
  return out;
}

export function cannyEdgeDetector(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  sigma = 1.2,
  lowThresh = 40,
  highThresh = 100
): Uint8ClampedArray {
  // 1. Gaussian Smoothing
  const gk = generateGaussianKernel2d(5, sigma);
  const smoothed = convolve2dGray(gray, w, h, gk, 'reflect');

  // 2. Sobel Gradient Magnitude & Angle
  const mag = new Float64Array(w * h);
  const ang = new Float64Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -smoothed[(y - 1) * w + (x - 1)] + smoothed[(y - 1) * w + (x + 1)] -
        2 * smoothed[y * w + (x - 1)] + 2 * smoothed[y * w + (x + 1)] -
        smoothed[(y + 1) * w + (x - 1)] + smoothed[(y + 1) * w + (x + 1)];
      const gy =
        -smoothed[(y - 1) * w + (x - 1)] - 2 * smoothed[(y - 1) * w + x] - smoothed[(y - 1) * w + (x + 1)] +
        smoothed[(y + 1) * w + (x - 1)] + 2 * smoothed[(y + 1) * w + x] + smoothed[(y + 1) * w + (x + 1)];
      mag[y * w + x] = Math.hypot(gx, gy);
      let deg = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (deg < 0) deg += 180;
      ang[y * w + x] = deg;
    }
  }

  // 3. Non-Maximum Suppression
  const nms = new Float64Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const m = mag[idx];
      const a = ang[idx];
      let q = 255;
      let r = 255;
      if ((a >= 0 && a < 22.5) || (a >= 157.5 && a <= 180)) {
        q = mag[y * w + (x + 1)];
        r = mag[y * w + (x - 1)];
      } else if (a >= 22.5 && a < 67.5) {
        q = mag[(y + 1) * w + (x - 1)];
        r = mag[(y - 1) * w + (x + 1)];
      } else if (a >= 67.5 && a < 112.5) {
        q = mag[(y + 1) * w + x];
        r = mag[(y - 1) * w + x];
      } else {
        q = mag[(y - 1) * w + (x - 1)];
        r = mag[(y + 1) * w + (x + 1)];
      }
      nms[idx] = m >= q && m >= r ? m : 0;
    }
  }

  // 4. Double Threshold + Hysteresis Edge Tracking
  const out = new Uint8ClampedArray(w * h);
  const queue: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (nms[i] >= highThresh) {
      out[i] = 255;
      queue.push(i);
    } else if (nms[i] >= lowThresh) {
      out[i] = 75;
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const cy = Math.floor(cur / w);
    const cx = cur % w;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const ny = cy + dy;
        const nx = cx + dx;
        if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
          const nIdx = ny * w + nx;
          if (out[nIdx] === 75) {
            out[nIdx] = 255;
            queue.push(nIdx);
          }
        }
      }
    }
  }

  for (let i = 0; i < w * h; i++) {
    if (out[i] !== 255) out[i] = 0;
  }
  return out;
}

export function harrisCornerDetector(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  k = 0.04,
  threshRatio = 0.05
): DetectedCorner[] {
  const n = w * h;
  const ixx = new Float64Array(n);
  const iyy = new Float64Array(n);
  const ixy = new Float64Array(n);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const ix = (gray[y * w + (x + 1)] - gray[y * w + (x - 1)]) * 0.5;
      const iy = (gray[(y + 1) * w + x] - gray[(y - 1) * w + x]) * 0.5;
      const idx = y * w + x;
      ixx[idx] = ix * ix;
      iyy[idx] = iy * iy;
      ixy[idx] = ix * iy;
    }
  }

  const resp = new Float64Array(n);
  let maxR = 0;
  const win = 1;
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      let sxx = 0;
      let syy = 0;
      let sxy = 0;
      for (let dy = -win; dy <= win; dy++) {
        for (let dx = -win; dx <= win; dx++) {
          const j = (y + dy) * w + (x + dx);
          sxx += ixx[j];
          syy += iyy[j];
          sxy += ixy[j];
        }
      }
      const det = sxx * syy - sxy * sxy;
      const trace = sxx + syy;
      const rVal = det - k * trace * trace;
      resp[y * w + x] = rVal;
      if (rVal > maxR) maxR = rVal;
    }
  }

  const threshold = maxR * threshRatio;
  const corners: DetectedCorner[] = [];
  if (maxR <= 0) return corners;

  for (let y = 3; y < h - 3; y++) {
    for (let x = 3; x < w - 3; x++) {
      const rVal = resp[y * w + x];
      if (rVal <= threshold) continue;
      let isLocalMax = true;
      for (let dy = -2; dy <= 2 && isLocalMax; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (resp[(y + dy) * w + (x + dx)] > rVal) {
            isLocalMax = false;
            break;
          }
        }
      }
      if (isLocalMax) {
        corners.push({ x, y, response: rVal });
      }
    }
  }

  corners.sort((a, b) => b.response - a.response);
  return corners.slice(0, 120);
}

// ============================================================================
// Chapter 14 — Morphological Image Processing
// ============================================================================

export function createStructuringElement(shape: MorphShape, size: 3 | 5 | 7): number[][] {
  const center = Math.floor(size / 2);
  const se: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const dy = Math.abs(y - center);
      const dx = Math.abs(x - center);
      if (shape === 'square') {
        row.push(1);
      } else if (shape === 'cross') {
        row.push(dx === 0 || dy === 0 ? 1 : 0);
      } else {
        row.push(dx * dx + dy * dy <= center * center + 0.5 ? 1 : 0);
      }
    }
    se.push(row);
  }
  return se;
}

function erodeOrDilate(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  se: number[][],
  isDilate: boolean
): Uint8ClampedArray {
  const size = se.length;
  const half = Math.floor(size / 2);
  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let extreme = isDilate ? 0 : 255;
      for (let ky = 0; ky < size; ky++) {
        for (let kx = 0; kx < size; kx++) {
          if (se[ky][kx] === 0) continue;
          const sy = sampleBorderIndex(y + ky - half, h, 'replicate');
          const sx = sampleBorderIndex(x + kx - half, w, 'replicate');
          const val = src[sy * w + sx];
          if (isDilate) {
            if (val > extreme) extreme = val;
          } else {
            if (val < extreme) extreme = val;
          }
        }
      }
      out[y * w + x] = extreme;
    }
  }
  return out;
}

export function applyMorphology(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  op: MorphOp,
  se: number[][]
): Uint8ClampedArray {
  if (op === 'erode') return erodeOrDilate(src, w, h, se, false);
  if (op === 'dilate') return erodeOrDilate(src, w, h, se, true);
  if (op === 'open') {
    const er = erodeOrDilate(src, w, h, se, false);
    return erodeOrDilate(er, w, h, se, true);
  }
  if (op === 'close') {
    const di = erodeOrDilate(src, w, h, se, true);
    return erodeOrDilate(di, w, h, se, false);
  }
  if (op === 'gradient') {
    const di = erodeOrDilate(src, w, h, se, true);
    const er = erodeOrDilate(src, w, h, se, false);
    const out = new Uint8ClampedArray(w * h);
    for (let i = 0; i < w * h; i++) out[i] = clampByte(di[i] - er[i]);
    return out;
  }
  if (op === 'tophat') {
    const opened = applyMorphology(src, w, h, 'open', se);
    const out = new Uint8ClampedArray(w * h);
    for (let i = 0; i < w * h; i++) out[i] = clampByte(src[i] - opened[i]);
    return out;
  }
  // blackhat
  const closed = applyMorphology(src, w, h, 'close', se);
  const out = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) out[i] = clampByte(closed[i] - src[i]);
  return out;
}

// ============================================================================
// Chapter 15 — Image Segmentation, Otsu, Connected Components, Measurements
// ============================================================================

export function thresholdGlobalMask(gray: Uint8ClampedArray, thresh: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i] > thresh ? 255 : 0;
  return out;
}

export function thresholdAdaptiveMean(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  blockSize = 15,
  cOffset = 5
): Uint8ClampedArray {
  const half = Math.floor(blockSize / 2);
  // Integral image for O(1) window mean
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 1; y <= h; y++) {
    let rowSum = 0;
    for (let x = 1; x <= w; x++) {
      rowSum += gray[(y - 1) * w + (x - 1)];
      integral[y * (w + 1) + x] = integral[(y - 1) * (w + 1) + x] + rowSum;
    }
  }

  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - half);
    const y1 = Math.min(h - 1, y + half);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(w - 1, x + half);
      const area = (y1 - y0 + 1) * (x1 - x0 + 1);
      const sum =
        integral[(y1 + 1) * (w + 1) + (x1 + 1)] -
        integral[y0 * (w + 1) + (x1 + 1)] -
        integral[(y1 + 1) * (w + 1) + x0] +
        integral[y0 * (w + 1) + x0];
      const localThresh = sum / area - cOffset;
      out[y * w + x] = gray[y * w + x] >= localThresh ? 255 : 0;
    }
  }
  return out;
}

export function computeOtsuThreshold(gray: Uint8ClampedArray): {
  threshold: number;
  betweenClassVariance: number;
  mask: Uint8ClampedArray;
} {
  const hist = new Float64Array(256);
  const total = gray.length;
  for (let i = 0; i < total; i++) hist[gray[i]]++;

  let sumAll = 0;
  for (let t = 0; t < 256; t++) sumAll += t * hist[t];

  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let bestT = 0;
  let sumTies = 0;
  let tieCount = 0;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar + 1e-9) {
      maxVar = varBetween;
      sumTies = t;
      tieCount = 1;
    } else if (Math.abs(varBetween - maxVar) <= 1e-9) {
      sumTies += t;
      tieCount++;
    }
  }
  bestT = tieCount > 0 ? Math.round(sumTies / tieCount) : 0;

  return {
    threshold: bestT,
    betweenClassVariance: maxVar / (total * total),
    mask: thresholdGlobalMask(gray, bestT),
  };
}

export function connectedComponentsAnalysis(
  mask: Uint8ClampedArray,
  w: number,
  h: number,
  minArea = 20
): {
  labels: Int32Array;
  coloredRgba: Uint8ClampedArray;
  objects: SegmentedObjectStats[];
} {
  const labels = new Int32Array(w * h);
  const objects: SegmentedObjectStats[] = [];
  let nextLabel = 1;
  const queue: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (mask[start] === 0 || labels[start] !== 0) continue;

      const labelId = nextLabel++;
      labels[start] = labelId;
      queue.length = 0;
      queue.push(start);

      let head = 0;
      let area = 0;
      let sumX = 0;
      let sumY = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let perimeter = 0;

      while (head < queue.length) {
        const cur = queue[head++];
        const cy = Math.floor(cur / w);
        const cx = cur % w;
        area++;
        sumX += cx;
        sumY += cy;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        let isBoundary = false;
        const n4 = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ];
        for (const [nx, ny] of n4) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h || mask[ny * w + nx] === 0) {
            isBoundary = true;
          } else {
            const nIdx = ny * w + nx;
            if (labels[nIdx] === 0) {
              labels[nIdx] = labelId;
              queue.push(nIdx);
            }
          }
        }
        if (isBoundary) perimeter++;
      }

      if (area >= minArea) {
        const circularity = perimeter > 0 ? Math.min(1, (4 * Math.PI * area) / (perimeter * perimeter)) : 0;
        objects.push({
          id: objects.length + 1,
          area,
          cx: sumX / area,
          cy: sumY / area,
          bbox: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
          perimeter,
          circularity,
        });
      } else {
        // Erase below minArea from labels
        for (const px of queue) labels[px] = 0;
      }
    }
  }

  const palette = [
    [56, 189, 248],
    [52, 211, 153],
    [245, 158, 11],
    [244, 114, 182],
    [167, 139, 250],
    [251, 113, 133],
    [45, 212, 191],
    [250, 204, 21],
  ];

  // Re-index non-zero labels sequentially for coloring
  const labelRemap = new Map<number, number>();
  let idxCounter = 0;
  const coloredRgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const lbl = labels[i];
    const j = i * 4;
    if (lbl === 0) {
      coloredRgba[j] = 10;
      coloredRgba[j + 1] = 15;
      coloredRgba[j + 2] = 28;
      coloredRgba[j + 3] = 255;
    } else {
      let mapped = labelRemap.get(lbl);
      if (mapped === undefined) {
        mapped = idxCounter++;
        labelRemap.set(lbl, mapped);
      }
      const col = palette[mapped % palette.length];
      coloredRgba[j] = col[0];
      coloredRgba[j + 1] = col[1];
      coloredRgba[j + 2] = col[2];
      coloredRgba[j + 3] = 255;
    }
  }

  return { labels, coloredRgba, objects };
}

export function computeSegmentationMetrics(
  predMask: Uint8ClampedArray,
  gtMask: Uint8ClampedArray
): { iou: number; dice: number; precision: number; recall: number } {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  const n = Math.min(predMask.length, gtMask.length);
  for (let i = 0; i < n; i++) {
    const p = predMask[i] > 0;
    const g = gtMask[i] > 0;
    if (p && g) tp++;
    else if (p && !g) fp++;
    else if (!p && g) fn++;
  }
  const iou = tp + fp + fn > 0 ? tp / (tp + fp + fn) : 1;
  const dice = 2 * tp + fp + fn > 0 ? (2 * tp) / (2 * tp + fp + fn) : 1;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  return { iou, dice, precision, recall };
}
