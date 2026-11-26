import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import masterCurriculumData from '../../content/curriculum/master-curriculum.json' with { type: 'json' };
import advancedModulesData from '../../content/curriculum/advanced-modules.json' with { type: 'json' };
import researchTracksData from '../../content/curriculum/research-tracks.json' with { type: 'json' };

export interface SlideData {
  id: number | string;
  title: string;
  lead?: string;
  subtitle?: string;
  body?: string;
  content?: string;
  bullets?: string[];
  diagram?: string | null;
  presenter?: string;
  institution?: string;
  notes?: string;
}

export function getSlideBodyText(slide: SlideData): string {
  if (slide.body && slide.body.trim()) return slide.body;
  if (slide.content && slide.content.trim()) return slide.content;
  if (slide.bullets && Array.isArray(slide.bullets) && slide.bullets.length > 0) {
    return slide.bullets.map((b) => `- ${b}`).join('\n');
  }
  return '';
}

export function getSlideLeadText(slide: SlideData): string {
  if (slide.lead && slide.lead.trim()) return slide.lead;
  if (slide.subtitle && slide.subtitle.trim()) return slide.subtitle;
  if (slide.institution && slide.presenter) {
    return `${slide.institution} · ${slide.presenter}`;
  }
  return '';
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  difficulty: string;
  durationMinutes: number;
  prerequisites: string[];
  tracks: string[];
  keywords: string[];
  status: string;
  version: string;
  lastUpdated: string;
  directory: string;
  description: string;
  learningObjectives: string[];
  resources: any;
}

export interface AcademicReference {
  id: string;
  title: string;
  authors: string;
  year: number;
  publisher: string;
  url: string;
  type: string;
  annotation?: string;
}

const textFiles = (typeof (import.meta as any).glob === 'function'
  ? import.meta.glob('../../content/**/*.{md,py,ipynb}', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
  : {}) as Record<string, string>;

const jsonFiles = (typeof (import.meta as any).glob === 'function'
  ? import.meta.glob('../../content/**/*.json', {
      eager: true,
      import: 'default',
    })
  : {}) as Record<string, unknown>;

function getFileContent(relPath: string): string {
  const vitePath = `../../${relPath}`;
  if (textFiles[vitePath]) return textFiles[vitePath];
  if (typeof (globalThis as any).readContentFile === 'function') {
    return (globalThis as any).readContentFile(relPath);
  }
  return '';
}

function getJsonContent<T>(relPath: string): T | null {
  const vitePath = `../../${relPath}`;
  if (jsonFiles[vitePath]) return jsonFiles[vitePath] as T;
  if (typeof (globalThis as any).readContentJson === 'function') {
    return (globalThis as any).readContentJson(relPath);
  }
  return null;
}

export const masterCurriculum = masterCurriculumData as {
  institution: string;
  author: string;
  tagline: string;
  chapters: Chapter[];
};

export function getChapterById(id: string): Chapter | undefined {
  return masterCurriculum.chapters.find((c) => c.id === id);
}

// ============================================================================
// MATHEMATICAL FORMATTING & PARSING UTILITIES
// Converts LaTeX expressions into clean, professional Unicode mathematical typography
// ============================================================================

export function formatMathToReadableText(latex: string): string {
  if (!latex) return '';

  let text = latex;

  // 1. Common Greek Letters (lower and uppercase)
  const greekMap: Record<string, string> = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\Gamma': 'Γ',
    '\\delta': 'δ', '\\Delta': 'Δ', '\\epsilon': 'ε', '\\varepsilon': 'ε',
    '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\Theta': 'Θ',
    '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\Lambda': 'Λ',
    '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\Xi': 'Ξ',
    '\\pi': 'π', '\\Pi': 'Π', '\\rho': 'ρ', '\\sigma': 'σ', '\\Sigma': 'Σ',
    '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ', '\\Phi': 'Φ',
    '\\chi': 'χ', '\\psi': 'ψ', '\\Psi': 'Ψ', '\\omega': 'ω', '\\Omega': 'Ω'
  };

  for (const [cmd, sym] of Object.entries(greekMap)) {
    text = text.replaceAll(cmd, sym);
  }

  // 2. Math operators and symbols
  const operatorMap: Record<string, string> = {
    '\\times': '×', '\\cdot': '·', '\\pm': '±', '\\mp': '∓',
    '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
    '\\neq': '≠', '\\ne': '≠', '\\approx': '≈', '\\sim': '~',
    '\\propto': '∝', '\\infty': '∞', '\\in': '∈', '\\notin': '∉',
    '\\subset': '⊂', '\\subseteq': '⊆', '\\cup': '∪', '\\cap': '∩',
    '\\rightarrow': '→', '\\to': '→', '\\leftarrow': '←',
    '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\leftrightarrow': '↔',
    '\\partial': '∂', '\\nabla': '∇', '\\forall': '∀', '\\exists': '∃',
    '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\oint': '∮',
    '\\circ': '°', '\\prime': '′', '\\dots': '…', '\\cdots': '⋯'
  };

  for (const [cmd, sym] of Object.entries(operatorMap)) {
    text = text.replaceAll(cmd, sym);
  }

  // 3. LaTeX formatting wrappers
  text = text.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathbf\s+([a-zA-Z0-9])/g, '$1');
  text = text.replace(/\\text\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathit\{([^}]+)\}/g, '$1');
  text = text.replace(/\\boldsymbol\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathbb\{R\}/g, 'ℝ');
  text = text.replace(/\\mathbb\{C\}/g, 'ℂ');
  text = text.replace(/\\mathbb\{Z\}/g, 'ℤ');
  text = text.replace(/\\mathbb\{N\}/g, 'ℕ');
  text = text.replace(/\\mathbb\{([A-Z])\}/g, '$1');

  // 4. Fractions: \frac{a}{b} -> (a / b)
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // 5. Square roots: \sqrt{x} -> √(x), \sqrt[n]{x} -> n√(x)
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');
  text = text.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // 6. Common superscripts
  const superMap: Record<string, string> = {
    '^2': '²', '^3': '³', '^T': 'ᵀ', '^H': 'ᴴ', '^{-1}': '⁻¹',
    '^0': '⁰', '^1': '¹', '^4': '⁴', '^5': '⁵', '^6': '⁶', '^7': '⁷', '^8': '⁸', '^9': '⁹',
    '^n': 'ⁿ', '^k': 'ᵏ', '^i': 'ⁱ', '^j': 'ʲ'
  };
  for (const [cmd, sup] of Object.entries(superMap)) {
    text = text.replaceAll(cmd, sup);
  }

  // 7. Common subscripts
  const subMap: Record<string, string> = {
    '_0': '₀', '_1': '₁', '_2': '₂', '_3': '₃', '_4': '₄',
    '_5': '₅', '_6': '₆', '_7': '₇', '_8': '₈', '_9': '₉',
    '_i': 'ᵢ', '_j': 'ⱼ', '_k': 'ₖ', '_s': 'ₛ', '_t': 'ₜ', '_n': 'ₙ',
    '_x': 'ₓ', '_y': 'ᵧ'
  };
  for (const [cmd, sub] of Object.entries(subMap)) {
    text = text.replaceAll(cmd, sub);
  }

  // 8. Clean leftover braces, backslashes and spacing
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');
  text = text.replace(/[{}]/g, '');
  text = text.replace(/\\,/g, ' ');
  text = text.replace(/\\;/g, ' ');
  text = text.replace(/\\quad/g, '   ');
  text = text.replace(/\\qquad/g, '      ');
  text = text.replace(/\$/g, '');

  return text.trim();
}

/**
 * Strips markdown emphasis and inline code delimiters while formatting inline math
 */
export function formatInlineMarkdown(text: string): string {
  if (!text) return '';

  // Process inline math $...$
  let result = text.replace(/\$([^$]+)\$/g, (_, math) => formatMathToReadableText(math));

  // Strip bold and italics
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');
  result = result.replace(/`([^`]+)`/g, '$1');

  return result;
}

// ============================================================================
// PARSED SLIDE CONTENT STRUCTURES
// ============================================================================

export type SlideBlock =
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string; level: number }
  | { type: 'numbered'; text: string; num: number }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'math'; latex: string; readable: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export function parseSlideBodyToBlocks(body: string): SlideBlock[] {
  if (!body) return [];

  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: SlideBlock[] = [];

  let inCode = false;
  let codeBuf: string[] = [];
  let codeLang = '';
  let inMath = false;
  let mathBuf: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const trimmed = raw.trim();

    // Fenced Code Blocks
    if (trimmed.startsWith('```')) {
      if (inMath) {
        blocks.push({
          type: 'math',
          latex: mathBuf.join('\n'),
          readable: formatMathToReadableText(mathBuf.join(' '))
        });
        mathBuf = [];
        inMath = false;
      }

      if (inCode) {
        blocks.push({ type: 'code', code: codeBuf.join('\n'), lang: codeLang });
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeBuf = [];
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    // Display Math Blocks ($$)
    if (inMath) {
      if (trimmed === '$$') {
        blocks.push({
          type: 'math',
          latex: mathBuf.join('\n'),
          readable: formatMathToReadableText(mathBuf.join(' '))
        });
        mathBuf = [];
        inMath = false;
        continue;
      }
      if (trimmed.endsWith('$$')) {
        const content = trimmed.slice(0, -2).trimEnd();
        if (content) mathBuf.push(content);
        blocks.push({
          type: 'math',
          latex: mathBuf.join('\n'),
          readable: formatMathToReadableText(mathBuf.join(' '))
        });
        mathBuf = [];
        inMath = false;
        continue;
      }
      mathBuf.push(raw);
      continue;
    }

    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const mathContent = trimmed.slice(2, -2);
      blocks.push({
        type: 'math',
        latex: mathContent,
        readable: formatMathToReadableText(mathContent)
      });
      continue;
    }

    if (trimmed === '$$') {
      inMath = true;
      mathBuf = [];
      continue;
    }

    if (trimmed.startsWith('$$')) {
      inMath = true;
      const startText = trimmed.slice(2).trimStart();
      mathBuf = startText ? [startText] : [];
      continue;
    }

    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#{1,4}\s+/, '');
      blocks.push({ type: 'heading', text: formatInlineMarkdown(headingText) });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'paragraph', text: `> ${formatInlineMarkdown(trimmed.slice(2))}` });
      continue;
    }

    // Bullets
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: formatInlineMarkdown(trimmed.slice(2)), level: 0 });
      continue;
    }

    // Numbered items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      blocks.push({
        type: 'numbered',
        num: parseInt(numMatch[1], 10),
        text: formatInlineMarkdown(numMatch[2])
      });
      continue;
    }

    // Plain Paragraph
    blocks.push({ type: 'paragraph', text: formatInlineMarkdown(trimmed) });
  }

  if (inMath && mathBuf.length > 0) {
    blocks.push({
      type: 'math',
      latex: mathBuf.join('\n'),
      readable: formatMathToReadableText(mathBuf.join(' '))
    });
  }

  if (inCode && codeBuf.length > 0) {
    blocks.push({ type: 'code', code: codeBuf.join('\n'), lang: codeLang });
  }

  return blocks;
}

// ============================================================================
// 1. POWERPOINT (.pptx) EXPORT ENGINE (PptxGenJS)
// Creates authentic, fully editable PowerPoint presentations with native objects
// ============================================================================

export interface PresentationExportOptions {
  deckTitle: string;
  categoryOrTrack: string;
  moduleCode: string;
  slides: SlideData[];
  author?: string;
  institution?: string;
  theme?: 'light' | 'dark';
  outputType?: 'download' | 'base64' | 'arraybuffer' | 'nodebuffer';
  fileName?: string;
}

export async function exportPresentationPptx(options: PresentationExportOptions): Promise<any> {
  const {
    deckTitle,
    categoryOrTrack,
    moduleCode,
    slides,
    author = 'Aji Pamungkas Tri Nurcahyo',
    institution = 'Institut Teknologi Sumatera (ITERA)',
    outputType = 'download',
    fileName = `${moduleCode.toLowerCase()}-presentation.pptx`
  } = options;

  const pptx = new PptxGenJS();

  // Widescreen 16:9 layout (10 x 5.625 inches)
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = author;
  pptx.company = institution;
  pptx.title = `${moduleCode}: ${deckTitle}`;
  pptx.subject = 'Multimedia & Computer Vision';

  // Palette Definition (Professional Academic Theme)
  const colors = {
    bg: 'FFFFFF',
    textDark: '0F172A', // Slate 900
    textMuted: '475569', // Slate 600
    primary: '0284C7', // Sky 600
    primaryDark: '0369A1', // Sky 700
    accent: '0F766E', // Teal 700
    cardBg: 'F8FAFC', // Slate 50
    cardBorder: 'E2E8F0', // Slate 200
    codeBg: 'F1F5F9', // Slate 100
    footerText: '64748B' // Slate 500
  };

  const totalSlides = slides.length;

  slides.forEach((slideData, idx) => {
    const isCover = idx === 0;
    const slide = pptx.addSlide();

    // 1. Slide Background
    slide.background = { color: colors.bg };

    // 2. Add Speaker Notes if present
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }

    if (isCover) {
      // ----------------------------------------------------
      // COVER / TITLE SLIDE LAYOUT
      // ----------------------------------------------------
      // Top color accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.15,
        fill: { color: colors.primary }
      });

      // Course Pill Badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 0.6,
        w: 4.8,
        h: 0.38,
        rectRadius: 0.08,
        fill: { color: colors.cardBg },
        line: { color: colors.primary, width: 1.2 }
      });

      slide.addText('MULTIMEDIA & COMPUTER VISION LEARNING HUB', {
        x: 0.8,
        y: 0.6,
        w: 4.8,
        h: 0.38,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: colors.primaryDark,
        align: 'center',
        valign: 'middle'
      });

      // Chapter / Module Code & Track
      slide.addText(`${moduleCode} · ${categoryOrTrack}`, {
        x: 0.8,
        y: 1.15,
        w: 8.4,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: colors.textMuted
      });

      // Deck Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.55,
        w: 8.4,
        h: 1.2,
        fontSize: 26,
        fontFace: 'Arial',
        bold: true,
        color: colors.textDark,
        valign: 'top'
      });

      // Lead / Subtitle
      if (slideData.lead) {
        slide.addText(slideData.lead, {
          x: 0.8,
          y: 2.85,
          w: 8.4,
          h: 0.65,
          fontSize: 14,
          fontFace: 'Arial',
          italic: true,
          color: colors.textMuted
        });
      }

      // Metadata Container Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.65,
        w: 8.4,
        h: 1.15,
        rectRadius: 0.06,
        fill: { color: colors.cardBg },
        line: { color: colors.cardBorder, width: 1 }
      });

      slide.addText(
        [
          { text: 'Institusi: ', options: { bold: true, color: colors.textDark } },
          { text: `${institution} · Program Studi S1 Teknik Telekomunikasi\n`, options: { color: colors.textMuted } },
          { text: 'Kurikulum & Penulis: ', options: { bold: true, color: colors.textDark } },
          { text: `${author}\n`, options: { color: colors.textMuted } },
          { text: 'Konteks Akademik: ', options: { bold: true, color: colors.textDark } },
          { text: 'Strategic Roadmap ISVWS 2026–2040 · Slide Presentasi Resmi', options: { color: colors.textMuted } }
        ],
        {
          x: 1.0,
          y: 3.75,
          w: 8.0,
          h: 0.95,
          fontSize: 10,
          fontFace: 'Arial',
          lineSpacing: 16
        }
      );
    } else {
      // ----------------------------------------------------
      // CONTENT SLIDE LAYOUT
      // ----------------------------------------------------
      // Top Thin Header Line
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.08,
        fill: { color: colors.primary }
      });

      // Category Breadcrumb
      slide.addText(`${moduleCode} · ${categoryOrTrack}`, {
        x: 0.8,
        y: 0.25,
        w: 8.4,
        h: 0.25,
        fontSize: 9,
        fontFace: 'Arial',
        bold: true,
        color: colors.primaryDark
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.5,
        w: 8.4,
        h: 0.5,
        fontSize: 19,
        fontFace: 'Arial',
        bold: true,
        color: colors.textDark
      });

      // Slide Subtitle / Lead
      let currentY = 1.02;
      const leadText = getSlideLeadText(slideData);
      if (leadText) {
        slide.addText(leadText, {
          x: 0.8,
          y: currentY,
          w: 8.4,
          h: 0.32,
          fontSize: 11,
          fontFace: 'Arial',
          italic: true,
          color: colors.textMuted
        });
        currentY += 0.35;
      }

      // Parse and render Body Blocks
      const bodyText = getSlideBodyText(slideData);
      const blocks = parseSlideBodyToBlocks(bodyText);

      // Collect bullet and text items into grouped text boxes or cards
      let bodyTextRuns: { text: string; options?: any }[] = [];

      for (const block of blocks) {
        if (currentY > 4.7) break; // Avoid footer overlap

        if (block.type === 'heading') {
          // Flush pending body text
          if (bodyTextRuns.length > 0) {
            slide.addText(bodyTextRuns, {
              x: 0.8,
              y: currentY,
              w: 8.4,
              fontSize: 11,
              fontFace: 'Arial',
              lineSpacing: 18
            });
            currentY += Math.min(1.5, bodyTextRuns.length * 0.28 + 0.1);
            bodyTextRuns = [];
          }

          slide.addText(block.text, {
            x: 0.8,
            y: currentY,
            w: 8.4,
            h: 0.3,
            fontSize: 13,
            fontFace: 'Arial',
            bold: true,
            color: colors.primaryDark
          });
          currentY += 0.32;
        } else if (block.type === 'bullet') {
          bodyTextRuns.push({
            text: block.text + '\n',
            options: {
              bullet: true,
              indentLevel: block.level,
              color: colors.textDark,
              fontSize: 11
            }
          });
        } else if (block.type === 'numbered') {
          bodyTextRuns.push({
            text: `${block.num}. ${block.text}\n`,
            options: {
              color: colors.textDark,
              fontSize: 11
            }
          });
        } else if (block.type === 'paragraph') {
          bodyTextRuns.push({
            text: block.text + '\n\n',
            options: {
              color: colors.textDark,
              fontSize: 11
            }
          });
        } else if (block.type === 'code') {
          // Flush pending text first
          if (bodyTextRuns.length > 0) {
            slide.addText(bodyTextRuns, {
              x: 0.8,
              y: currentY,
              w: 8.4,
              fontSize: 11,
              fontFace: 'Arial',
              lineSpacing: 18
            });
            currentY += Math.min(1.5, bodyTextRuns.length * 0.28 + 0.1);
            bodyTextRuns = [];
          }

          // Code Container Box
          const codeLines = block.code.split('\n').length;
          const boxHeight = Math.min(1.6, Math.max(0.6, codeLines * 0.22 + 0.2));

          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.8,
            y: currentY,
            w: 8.4,
            h: boxHeight,
            rectRadius: 0.05,
            fill: { color: colors.codeBg },
            line: { color: colors.cardBorder, width: 1 }
          });

          slide.addText(block.code, {
            x: 0.95,
            y: currentY + 0.08,
            w: 8.1,
            h: boxHeight - 0.16,
            fontSize: 9.5,
            fontFace: 'Consolas',
            color: colors.textDark,
            valign: 'top'
          });

          currentY += boxHeight + 0.15;
        } else if (block.type === 'math') {
          // Flush pending text
          if (bodyTextRuns.length > 0) {
            slide.addText(bodyTextRuns, {
              x: 0.8,
              y: currentY,
              w: 8.4,
              fontSize: 11,
              fontFace: 'Arial',
              lineSpacing: 18
            });
            currentY += Math.min(1.5, bodyTextRuns.length * 0.28 + 0.1);
            bodyTextRuns = [];
          }

          // Mathematical Callout Container
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 1.2,
            y: currentY,
            w: 7.6,
            h: 0.65,
            rectRadius: 0.05,
            fill: { color: colors.cardBg },
            line: { color: colors.primary, width: 1 }
          });

          slide.addText(block.readable, {
            x: 1.3,
            y: currentY + 0.05,
            w: 7.4,
            h: 0.55,
            fontSize: 13,
            fontFace: 'Cambria Math',
            italic: true,
            bold: true,
            color: colors.primaryDark,
            align: 'center',
            valign: 'middle'
          });

          currentY += 0.75;
        }
      }

      // Flush remaining body runs
      if (bodyTextRuns.length > 0 && currentY <= 4.7) {
        slide.addText(bodyTextRuns, {
          x: 0.8,
          y: currentY,
          w: 8.4,
          fontSize: 11,
          fontFace: 'Arial',
          lineSpacing: 18
        });
      }
    }

    // ------------------------------------------------------
    // UNIVERSAL ACADEMIC FOOTER (All Slides)
    // ------------------------------------------------------
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 5.05,
      w: 8.4,
      h: 0,
      line: { color: colors.cardBorder, width: 0.8 }
    });

    slide.addText(`${institution} · S1 Teknik Telekomunikasi`, {
      x: 0.8,
      y: 5.15,
      w: 3.5,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: colors.footerText
    });

    slide.addText(`${author} · Multimedia & Computer Vision`, {
      x: 3.5,
      y: 5.15,
      w: 3.8,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Arial',
      align: 'center',
      color: colors.footerText
    });

    slide.addText(`Slide ${idx + 1} / ${totalSlides}`, {
      x: 7.5,
      y: 5.15,
      w: 1.7,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      align: 'right',
      color: colors.textDark
    });
  });

  // Output handling
  if (outputType === 'download') {
    return await pptx.writeFile({ fileName });
  } else if (outputType === 'base64') {
    return await pptx.write({ outputType: 'base64' });
  } else if (outputType === 'arraybuffer') {
    return await pptx.write({ outputType: 'arraybuffer' });
  } else if (outputType === 'nodebuffer') {
    return await pptx.write({ outputType: 'nodebuffer' });
  }

  return await pptx.write({ outputType: 'arraybuffer' });
}

// ============================================================================
// 2. PRESENTATION PDF EXPORT ENGINE (jsPDF 16:9 Widescreen)
// Generates high-fidelity PDF slides preserving 16:9 ratio and academic structure
// ============================================================================

export interface PresentationPdfOptions {
  deckTitle?: string;
  categoryOrTrack: string;
  moduleCode: string;
  slides: SlideData[];
  author?: string;
  institution?: string;
  fileName?: string;
  outputType?: 'download' | 'arraybuffer';
}

export function exportPresentationPdf(options: PresentationPdfOptions): Uint8Array | void {
  const {
    categoryOrTrack,
    moduleCode,
    slides,
    author = 'Aji Pamungkas Tri Nurcahyo',
    institution = 'Institut Teknologi Sumatera (ITERA)',
    fileName = `${moduleCode.toLowerCase()}-presentation.pdf`,
    outputType = 'download'
  } = options;

  // 16:9 Widescreen dimensions in inches: 10 in x 5.625 in
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [10, 5.625]
  });

  const totalSlides = slides.length;

  slides.forEach((slide, idx) => {
    if (idx > 0) {
      doc.addPage([10, 5.625], 'landscape');
    }

    // Slide Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 10, 5.625, 'F');

    // Top Accent Stripe
    doc.setFillColor(2, 132, 199); // Sky-600
    doc.rect(0, 0, 10, 0.08, 'F');

    if (idx === 0) {
      // Title Slide
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(3, 105, 161);
      doc.text('MULTIMEDIA & COMPUTER VISION LEARNING HUB', 0.8, 0.8);

      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text(`${moduleCode} · ${categoryOrTrack}`, 0.8, 1.2);

      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text(doc.splitTextToSize(slide.title, 8.4), 0.8, 1.7);

      if (slide.lead) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(13);
        doc.setTextColor(71, 85, 105);
        doc.text(doc.splitTextToSize(slide.lead, 8.4), 0.8, 2.6);
      }

      // Metadata Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(0.8, 3.4, 8.4, 1.2, 0.08, 0.08, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Institusi: ${institution} · S1 Teknik Telekomunikasi`, 1.0, 3.75);
      doc.text(`Kurikulum & Penulis: ${author}`, 1.0, 4.05);
      doc.text('Konteks: Strategic Roadmap ISVWS 2026–2040 · Slide Presentasi Resmi', 1.0, 4.35);
    } else {
      // Content Slide
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(3, 105, 161);
      doc.text(`${moduleCode} · ${categoryOrTrack}`, 0.8, 0.4);

      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      doc.text(doc.splitTextToSize(slide.title, 8.4), 0.8, 0.72);

      let curY = 1.05;
      const leadText = getSlideLeadText(slide);
      if (leadText) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        const leadLines = doc.splitTextToSize(leadText, 8.4);
        doc.text(leadLines, 0.8, curY);
        curY += leadLines.length * 0.22 + 0.15;
      }

      const bodyText = getSlideBodyText(slide);
      const blocks = parseSlideBodyToBlocks(bodyText);

      for (const block of blocks) {
        if (curY > 4.7) break;

        if (block.type === 'heading') {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(3, 105, 161);
          doc.text(block.text, 0.8, curY);
          curY += 0.28;
        } else if (block.type === 'bullet') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.circle(0.85, curY - 0.03, 0.025, 'F');
          const lines = doc.splitTextToSize(block.text, 8.1);
          doc.text(lines, 0.95, curY);
          curY += lines.length * 0.2 + 0.06;
        } else if (block.type === 'numbered') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(`${block.num}. ${block.text}`, 8.4);
          doc.text(lines, 0.8, curY);
          curY += lines.length * 0.2 + 0.06;
        } else if (block.type === 'paragraph') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(block.text, 8.4);
          doc.text(lines, 0.8, curY);
          curY += lines.length * 0.2 + 0.08;
        } else if (block.type === 'code') {
          const codeLines = doc.splitTextToSize(block.code, 8.0);
          const boxHeight = Math.min(1.4, codeLines.length * 0.18 + 0.16);

          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(0.8, curY, 8.4, boxHeight, 0.05, 0.05, 'FD');

          doc.setFont('courier', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(codeLines, 0.95, curY + 0.16);
          curY += boxHeight + 0.15;
        } else if (block.type === 'math') {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(2, 132, 199);
          doc.roundedRect(1.0, curY, 8.0, 0.5, 0.05, 0.05, 'FD');

          doc.setFont('times', 'bolditalic');
          doc.setFontSize(12);
          doc.setTextColor(3, 105, 161);
          doc.text(block.readable, 5.0, curY + 0.32, { align: 'center' });
          curY += 0.62;
        }
      }
    }

    // Universal Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(0.8, 5.05, 9.2, 5.05);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${institution} · S1 Teknik Telekomunikasi`, 0.8, 5.25);
    doc.text(`${author} · Multimedia & Computer Vision`, 5.0, 5.25, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Slide ${idx + 1} / ${totalSlides}`, 9.2, 5.25, { align: 'right' });
  });

  if (outputType === 'download') {
    doc.save(fileName);
    return;
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

// ============================================================================
// 3. COMPLETE CHAPTER READING PDF ENGINE (A4 Portrait)
// Exports comprehensive textbook reading modules with references and metadata
// ============================================================================

export interface ChapterPdfOptions {
  chapter: Chapter;
  readingMarkdown: string;
  references?: AcademicReference[];
  outputType?: 'download' | 'arraybuffer';
  fileName?: string;
}

export function exportChapterPdf(options: ChapterPdfOptions): Uint8Array | void {
  const {
    chapter,
    readingMarkdown,
    references = [],
    outputType = 'download',
    fileName = `chapter-${chapter.id}-${chapter.slug}.pdf`
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210mm x 297mm
  });

  const pageW = 210;
  const pageH = 297;
  const marginX = 18;
  const contentW = pageW - marginX * 2; // 174mm
  let curY = 22;

  const checkPageBreak = (neededHeight: number) => {
    if (curY + neededHeight > pageH - 22) {
      doc.addPage('a4', 'portrait');
      drawHeaderAndFooter();
      curY = 25;
    }
  };

  const drawHeaderAndFooter = () => {
    const pageNum = doc.getNumberOfPages();

    // Running Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Chapter ${chapter.id}: ${chapter.title} · Multimedia & Computer Vision`,
      marginX,
      12
    );
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, 14, pageW - marginX, 14);

    // Running Footer
    doc.line(marginX, pageH - 14, pageW - marginX, pageH - 14);
    doc.text('Institut Teknologi Sumatera (ITERA) · S1 Teknik Telekomunikasi', marginX, pageH - 9);
    doc.text(`Halaman ${pageNum}`, pageW - marginX, pageH - 9, { align: 'right' });
  };

  // 1. First Page Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text('INSTITUT TEKNOLOGI SUMATERA (ITERA)', marginX, curY);
  curY += 5;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Program Studi S1 Teknik Telekomunikasi · Strategic Roadmap ISVWS 2026–2040', marginX, curY);
  curY += 7;

  // Chapter Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(`Chapter ${chapter.id}: ${chapter.title}`, contentW);
  doc.text(titleLines, marginX, curY);
  curY += titleLines.length * 7 + 4;

  // Chapter Description
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(chapter.description, contentW);
  doc.text(descLines, marginX, curY);
  curY += descLines.length * 4.8 + 5;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, curY, contentW, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bagian: ${chapter.sectionTitle}`, marginX + 4, curY + 5.5);
  doc.text(`Tingkat: ${chapter.difficulty.toUpperCase()} · Durasi: ${chapter.durationMinutes} Menit`, marginX + 4, curY + 11.5);

  const authorText = `Penulis: Aji Pamungkas Tri Nurcahyo`;
  doc.text(authorText, pageW - marginX - 4, curY + 5.5, { align: 'right' });
  doc.text(`Status: Verified Published (v${chapter.version})`, pageW - marginX - 4, curY + 11.5, { align: 'right' });
  curY += 21;

  // Learning Objectives (Capaian Pembelajaran)
  if (chapter.learningObjectives && chapter.learningObjectives.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    const boxHeight = chapter.learningObjectives.length * 4.8 + 9;
    doc.roundedRect(marginX, curY, contentW, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(3, 105, 161);
    doc.text('Capaian Pembelajaran (Learning Objectives):', marginX + 4, curY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    let objY = curY + 10.5;
    chapter.learningObjectives.forEach((obj) => {
      doc.text(`•  ${obj}`, marginX + 6, objY);
      objY += 4.5;
    });

    curY += boxHeight + 7;
  }

  // Reading Content Parsing (Markdown lines)
  const rawLines = readingMarkdown.replace(/\r\n/g, '\n').split('\n');
  let inCode = false;
  let codeBuf: string[] = [];

  for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
    const line = rawLines[lIdx];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        // Output code box
        const codeText = codeBuf.join('\n');
        const codeLines = doc.splitTextToSize(codeText, contentW - 8);
        const codeH = codeLines.length * 3.6 + 6;

        checkPageBreak(codeH);
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(marginX, curY, contentW, codeH, 1, 1, 'FD');

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(codeLines, marginX + 4, curY + 4.5);

        curY += codeH + 4;
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
        codeBuf = [];
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (!trimmed) {
      curY += 2;
      continue;
    }

    // Main section headings (## )
    if (trimmed.startsWith('## ')) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(2, 132, 199);
      const text = formatInlineMarkdown(trimmed.slice(3));
      doc.text(text, marginX, curY);
      curY += 6;
      continue;
    }

    // Subsection headings (### )
    if (trimmed.startsWith('### ')) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      const text = formatInlineMarkdown(trimmed.slice(4));
      doc.text(text, marginX, curY);
      curY += 5;
      continue;
    }

    // Display Math ($$...$$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      checkPageBreak(14);
      const mathReadable = formatMathToReadableText(trimmed.slice(2, -2));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(marginX + 10, curY, contentW - 20, 10, 1, 1, 'FD');

      doc.setFont('times', 'bolditalic');
      doc.setFontSize(11);
      doc.setTextColor(3, 105, 161);
      doc.text(mathReadable, pageW / 2, curY + 6.5, { align: 'center' });
      curY += 13;
      continue;
    }

    // Bullet items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const cleanText = formatInlineMarkdown(trimmed.slice(2));
      const lines = doc.splitTextToSize(cleanText, contentW - 6);
      doc.circle(marginX + 2, curY - 1, 0.6, 'F');
      doc.text(lines, marginX + 5, curY);
      curY += lines.length * 4.2 + 1.5;
      continue;
    }

    // Standard Paragraph
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const cleanPara = formatInlineMarkdown(trimmed);
    const paraLines = doc.splitTextToSize(cleanPara, contentW);
    doc.text(paraLines, marginX, curY);
    curY += paraLines.length * 4.2 + 2;
  }

  // Academic References Section
  if (references.length > 0) {
    checkPageBreak(25);
    curY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(2, 132, 199);
    doc.text('Daftar Pustaka & Referensi Akademik', marginX, curY);
    curY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    references.forEach((ref, rIdx) => {
      checkPageBreak(10);
      const refLine = `[${rIdx + 1}] ${ref.authors} (${ref.year}). "${ref.title}". ${ref.publisher}.`;
      const splitRef = doc.splitTextToSize(refLine, contentW);
      doc.text(splitRef, marginX, curY);
      curY += splitRef.length * 3.8 + 2;
    });
  }

  // Draw header/footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawHeaderAndFooter();
  }

  if (outputType === 'download') {
    doc.save(fileName);
    return;
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

// ============================================================================
// 4. CLIENT DOWNLOAD HELPERS (Browser-Native File Triggers)
// Direct downloads for Python scripts and Jupyter notebooks without third-party popups
// ============================================================================

export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

export function downloadPythonScript(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/x-python;charset=utf-8' });
  triggerBrowserDownload(blob, fileName);
}

export function downloadJupyterNotebook(notebookContent: string, fileName: string): void {
  const blob = new Blob([notebookContent], { type: 'application/x-ipynb+json;charset=utf-8' });
  triggerBrowserDownload(blob, fileName);
}

// ============================================================================
// 5. EXPORT COVERAGE AUDIT & AVAILABILITY MANIFEST
// Provides programmatic validation of exportable assets across Core, L3 and L4
// ============================================================================

export interface ModuleExportManifest {
  id: string;
  code: string;
  title: string;
  tier: 'core' | 'advanced' | 'research';
  formats: {
    pptx: boolean;
    presentationPdf: boolean;
    chapterPdf: boolean;
    pythonCode: boolean;
    jupyterNotebook: boolean;
  };
  fileNames: {
    pptx?: string;
    presentationPdf?: string;
    chapterPdf?: string;
    pythonCode?: string;
    jupyterNotebook?: string;
  };
}

export function getExportCoverageManifest(): ModuleExportManifest[] {
  const manifest: ModuleExportManifest[] = [];

  // 1. Core Chapters 01–60
  masterCurriculum.chapters.forEach((ch) => {
    const hasNotebook = parseInt(ch.id, 10) >= 36;
    manifest.push({
      id: ch.id,
      code: `Chapter ${ch.id}`,
      title: ch.title,
      tier: 'core',
      formats: {
        pptx: true,
        presentationPdf: true,
        chapterPdf: true,
        pythonCode: true,
        jupyterNotebook: hasNotebook
      },
      fileNames: {
        pptx: `chapter-${ch.id}-${ch.slug}-presentation.pptx`,
        presentationPdf: `chapter-${ch.id}-${ch.slug}-presentation.pdf`,
        chapterPdf: `chapter-${ch.id}-${ch.slug}-materi-lengkap.pdf`,
        pythonCode: `chapter-${ch.id}-practice.py`,
        jupyterNotebook: hasNotebook ? `chapter-${ch.id}-lab.ipynb` : undefined
      }
    });
  });

  // 2. Advanced Modules ADV-01..ADV-08
  advancedModulesData.forEach((adv: any) => {
    manifest.push({
      id: adv.id,
      code: adv.code,
      title: adv.title,
      tier: 'advanced',
      formats: {
        pptx: true,
        presentationPdf: true,
        chapterPdf: true,
        pythonCode: true,
        jupyterNotebook: true
      },
      fileNames: {
        pptx: `${adv.id}-presentation.pptx`,
        presentationPdf: `${adv.id}-presentation.pdf`,
        chapterPdf: `${adv.id}-materi-lengkap.pdf`,
        pythonCode: `${adv.id}-example.py`,
        jupyterNotebook: `${adv.id}-lab.ipynb`
      }
    });
  });

  // 3. Research Tracks R01..R06
  // (Research Tracks do not use classroom slide decks; they provide research workflows and code)
  researchTracksData.forEach((res: any) => {
    manifest.push({
      id: res.id,
      code: res.code,
      title: res.title,
      tier: 'research',
      formats: {
        pptx: false,
        presentationPdf: false,
        chapterPdf: true, // Complete Research Guide PDF
        pythonCode: true,
        jupyterNotebook: true
      },
      fileNames: {
        chapterPdf: `${res.id}-panduan-riset.pdf`,
        pythonCode: `${res.id}-research-baseline.py`,
        jupyterNotebook: `${res.id}-research-baseline.ipynb`
      }
    });
  });

  return manifest;
}

// ============================================================================
// 6. HIGH-LEVEL DOWNLOAD ACTIONS (READY FOR UI BINDING)
// Clean one-click export triggers that orchestrate data retrieval and file delivery
// ============================================================================

export async function downloadChapterPptx(chapterId: string): Promise<void> {
  const chapter = getChapterById(chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);

  const slides = getJsonContent<SlideData[]>(`content/chapters/chapter-${chapterId}/${chapter.resources.slides.path}`) || [];
  if (slides.length === 0) throw new Error(`Slides for Chapter ${chapterId} not found`);

  await exportPresentationPptx({
    deckTitle: chapter.title,
    categoryOrTrack: chapter.sectionTitle,
    moduleCode: `Chapter ${chapter.id}`,
    slides,
    fileName: `chapter-${chapter.id}-${chapter.slug}-slides.pptx`,
    outputType: 'download'
  });
}

export function downloadChapterPresentationPdf(chapterId: string): void {
  const chapter = getChapterById(chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);

  const slides = getJsonContent<SlideData[]>(`content/chapters/chapter-${chapterId}/${chapter.resources.slides.path}`) || [];
  if (slides.length === 0) throw new Error(`Slides for Chapter ${chapterId} not found`);

  exportPresentationPdf({
    categoryOrTrack: chapter.sectionTitle,
    moduleCode: `Chapter ${chapter.id}`,
    slides,
    fileName: `chapter-${chapter.id}-${chapter.slug}-slides.pdf`,
    outputType: 'download'
  });
}

export function downloadChapterCompletePdf(chapterId: string): void {
  const chapter = getChapterById(chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);

  const reading = getFileContent(`content/chapters/chapter-${chapterId}/${chapter.resources.reading.path}`);
  const references = getJsonContent<AcademicReference[]>(`content/chapters/chapter-${chapterId}/${chapter.resources.references.path}`) || [];

  exportChapterPdf({
    chapter,
    readingMarkdown: reading,
    references,
    fileName: `chapter-${chapter.id}-${chapter.slug}-materi-lengkap.pdf`,
    outputType: 'download'
  });
}

export function downloadChapterPythonCode(chapterId: string): void {
  const chapter = getChapterById(chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);

  const code = getFileContent(`content/chapters/chapter-${chapterId}/${chapter.resources.practice.path}`);
  if (!code) throw new Error(`Python code for Chapter ${chapterId} not found`);

  downloadPythonScript(code, `chapter-${chapter.id}-${chapter.slug}-practice.py`);
}

export function downloadChapterLabNotebook(chapterId: string): void {
  const chapter = getChapterById(chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);

  const nb = getFileContent(`content/chapters/chapter-${chapterId}/notebooks/chapter-${chapterId}-lab.ipynb`);
  if (!nb) throw new Error(`Notebook for Chapter ${chapterId} not found`);

  downloadJupyterNotebook(nb, `chapter-${chapter.id}-${chapter.slug}-lab.ipynb`);
}

// Advanced Module Exporters
export async function downloadAdvancedPptx(advId: string): Promise<void> {
  const adv = advancedModulesData.find((m: any) => m.id === advId);
  if (!adv) throw new Error(`Advanced module ${advId} not found`);

  const slides = getJsonContent<SlideData[]>(`content/advanced/${advId}/slides.json`) || [];
  if (slides.length === 0) throw new Error(`Slides for ${advId} not found`);

  await exportPresentationPptx({
    deckTitle: adv.title,
    categoryOrTrack: adv.pillarName,
    moduleCode: adv.code,
    slides,
    fileName: `${adv.id}-presentation.pptx`,
    outputType: 'download'
  });
}

export function downloadAdvancedPresentationPdf(advId: string): void {
  const adv = advancedModulesData.find((m: any) => m.id === advId);
  if (!adv) throw new Error(`Advanced module ${advId} not found`);

  const slides = getJsonContent<SlideData[]>(`content/advanced/${advId}/slides.json`) || [];
  if (slides.length === 0) throw new Error(`Slides for ${advId} not found`);

  exportPresentationPdf({
    categoryOrTrack: adv.pillarName,
    moduleCode: adv.code,
    slides,
    fileName: `${adv.id}-presentation.pdf`,
    outputType: 'download'
  });
}

export function downloadAdvancedCompletePdf(advId: string): void {
  const adv = advancedModulesData.find((m: any) => m.id === advId);
  if (!adv) throw new Error(`Advanced module ${advId} not found`);

  const reading = getFileContent(`content/advanced/${advId}/index.md`);
  const references = getJsonContent<AcademicReference[]>(`content/advanced/${advId}/references.json`) || [];

  // Adapt to Chapter schema for PDF generator
  const syntheticChapter: Chapter = {
    id: adv.code,
    slug: adv.id,
    title: adv.title,
    sectionId: String(adv.pillar),
    sectionTitle: adv.pillarName,
    difficulty: 'advanced',
    durationMinutes: (adv.estimatedHours || 14) * 60,
    prerequisites: (adv.prerequisites?.coreChapters || []).map((c: string) => `Chapter ${c}`),
    tracks: [String(adv.pillar)],
    keywords: adv.prerequisites?.mathCompetencies || [],
    status: 'published',
    version: '1.0.0',
    lastUpdated: '2026-11-20',
    directory: `content/advanced/${adv.id}`,
    description: adv.description,
    learningObjectives: [adv.subtitle || adv.description],
    resources: {
      reading: { status: 'available', path: 'index.md' },
      slides: { status: 'available', path: 'slides.json' },
      practice: { status: 'available', path: 'examples/example-01.py' },
      exercises: { status: 'available', path: 'exercises.json' },
      quiz: { status: 'available', path: 'quiz.json' },
      references: { status: 'available', path: 'references.json' },
      media: { status: 'available', path: 'media.json' }
    }
  };

  exportChapterPdf({
    chapter: syntheticChapter,
    readingMarkdown: reading,
    references,
    fileName: `${adv.id}-materi-lengkap.pdf`,
    outputType: 'download'
  });
}

export function downloadAdvancedPythonCode(advId: string): void {
  const code = getFileContent(`content/advanced/${advId}/examples/example-01.py`);
  if (!code) throw new Error(`Python code for ${advId} not found`);
  downloadPythonScript(code, `${advId}-practice.py`);
}

export function downloadAdvancedLabNotebook(advId: string): void {
  const nb = getFileContent(`content/advanced/${advId}/notebooks/${advId}-lab.ipynb`);
  if (!nb) throw new Error(`Notebook for ${advId} not found`);
  downloadJupyterNotebook(nb, `${advId}-lab.ipynb`);
}

// Research Track Exporters
export function downloadResearchGuidePdf(trackId: string): void {
  const res = researchTracksData.find((r: any) => r.id === trackId);
  if (!res) throw new Error(`Research track ${trackId} not found`);

  const guide = getFileContent(`content/research/${trackId}/guided-workflow.md`) || getFileContent(`content/research/${trackId}/index.md`);

  const syntheticChapter: Chapter = {
    id: res.code,
    slug: res.id,
    title: res.title,
    sectionId: String(res.pillar),
    sectionTitle: res.pillarName,
    difficulty: 'advanced',
    durationMinutes: 40 * 60,
    prerequisites: (res.prerequisites?.advancedModules || []).map((m: string) => m.toUpperCase()),
    tracks: [String(res.pillar)],
    keywords: [res.category || 'Research'],
    status: 'published',
    version: '1.0.0',
    lastUpdated: '2026-11-22',
    directory: `content/research/${res.id}`,
    description: res.description,
    learningObjectives: [res.subtitle || res.description],
    resources: {
      reading: { status: 'available', path: 'guided-workflow.md' },
      slides: { status: 'unavailable', path: '' },
      practice: { status: 'available', path: 'examples/example-01.py' },
      exercises: { status: 'unavailable', path: '' },
      quiz: { status: 'unavailable', path: '' },
      references: { status: 'unavailable', path: '' },
      media: { status: 'unavailable', path: '' }
    }
  };

  exportChapterPdf({
    chapter: syntheticChapter,
    readingMarkdown: guide,
    references: [],
    fileName: `${res.id}-panduan-riset.pdf`,
    outputType: 'download'
  });
}

export function downloadResearchPythonCode(trackId: string): void {
  const code = getFileContent(`content/research/${trackId}/examples/example-01.py`);
  if (!code) throw new Error(`Python code for ${trackId} not found`);
  downloadPythonScript(code, `${trackId}-research-baseline.py`);
}

export function downloadResearchBaselineNotebook(trackId: string): void {
  const nb = getFileContent(`content/research/${trackId}/notebooks/${trackId}-research-baseline.ipynb`);
  if (!nb) throw new Error(`Notebook for ${trackId} not found`);
  downloadJupyterNotebook(nb, `${trackId}-research-baseline.ipynb`);
}

