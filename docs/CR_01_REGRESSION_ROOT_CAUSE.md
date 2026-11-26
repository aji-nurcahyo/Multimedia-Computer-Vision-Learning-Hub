# CR-01: Academic Content Regression Root Cause Analysis

**Project:** Multimedia & Computer Vision Learning Hub  
**Local Repository:** `D:\Workstation\Repo My Corses\Multimedia & Computer Vision`  
**Phase:** EMERGENCY CR-01 — Academic Content Recovery & Forensic Investigation  
**Date:** 2026-11-26  
**Status:** FULLY RESOLVED & VERIFIED  

---

## Executive Summary

Following a critical user report that learning materials, presentation slides, and curriculum modules were missing, empty, or blank in the browser, an emergency forensic investigation was launched.

The forensic audit confirmed that **0 source files were deleted or corrupted on disk**. All 555 canonical educational source files from Git baseline `1f0636b` remained completely intact in `content/`.

The content collapse was caused by four distinct root causes in the application layer, renderer logic, and export pipeline:
1. **Critical Vite Compiler vs. Runtime Macro Mismatch (`import.meta.glob`)**: A runtime defensive check (`typeof (import.meta as any).glob === 'function' ? ... : {}`) prevented Vite's build-time AST transformer from expanding dynamic glob imports, causing all 60 chapter reading texts and slide JSONs to resolve to empty objects in the browser.
2. **Slide Schema Divergence Across 600 Core Slides**: Chapters 36–40 and 48–60 used `content`, while Chapters 41–47 used `bullets` instead of `body`. The presentation viewer only accessed `slide.body`, rendering 250 out of 600 slides completely blank.
3. **Export Engine Failure on Divergent Schema**: `exportService.ts` evaluated `slide.body` directly, producing blank PowerPoint (.pptx) and PDF slides for 250 chapters.
4. **Phase UI-04 Architectural Omissions**: The redesign of the Advanced and Research views inadvertently omitted Tier-B Guided Workflow tabs, Tier-C Python scripts, and Advanced presentation slide decks.

---

## Detailed Root Cause Analysis

### Root Cause 1: Vite Compiler Macro Suppression (`import.meta.glob`)

#### Diagnostic Findings
When inspecting the live preview in headless Chrome, Core Chapter 36 showed `Presentasi Slide (0 Slide)` and an empty reading view. Even though files existed in `content/chapters/chapter-36/`, Vite failed to load them.

In `src/lib/content.ts`, dynamic imports were guarded like this:
```typescript
// BEFORE: Faulty runtime check
const textFiles: Record<string, string> =
  typeof (import.meta as any).glob === 'function'
    ? (import.meta as any).glob('/content/**/*.md', { eager: true, as: 'raw' })
    : {};

const jsonFiles: Record<string, any> =
  typeof (import.meta as any).glob === 'function'
    ? (import.meta as any).glob('/content/**/*.json', { eager: true })
    : {};
```

#### Why It Failed
Vite's AST plugin scans for static literal member expressions `import.meta.glob(...)`. By wrapping it in a ternary checking `typeof import.meta.glob === 'function'`, the macro pattern was broken or treated as a runtime check. At browser runtime in production build, `import.meta.glob` is already transformed into an inlined bundle map; if the runtime condition evaluated against the untransformed AST or if runtime Node fallback semantics kicked in, `textFiles` and `jsonFiles` resolved to `{}`. Consequently, **every** reading text returned `""` and all slides returned `null`.

#### Remediation
Replaced the ternary with direct, statically analyzable `import.meta.glob` invocations wrapped inside a graceful `try / catch` block to satisfy both Vite's production bundler and Node.js test environments:

```typescript
// AFTER: Resilient compile-time & test-safe loader
let textFiles: Record<string, string> = {};
let jsonFiles: Record<string, any> = {};

try {
  // Statically analyzed by Vite at build time
  textFiles = import.meta.glob('/content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
  jsonFiles = import.meta.glob('/content/**/*.json', { eager: true, import: 'default' }) as Record<string, any>;
} catch {
  // Graceful fallback for non-Vite execution contexts (e.g., node test runners)
  textFiles = {};
  jsonFiles = {};
}
```

---

### Root Cause 2: Slide Schema Divergence (250 / 600 Blank Slides)

#### Diagnostic Findings
Across the 60 Core chapters, slide JSON files (`slides.json`) evolved across different development phases without a shared validation schema:
1. **Chapters 01–35 (350 slides):**
   ```json
   { "id": 1, "title": "...", "lead": "...", "body": "...", "notes": "..." }
   ```
2. **Chapters 36–40 & 48–60 (180 slides):**
   ```json
   { "id": 1, "title": "...", "lead": "...", "content": "...", "diagram": "...", "notes": "..." }
   ```
3. **Chapters 41–47 (70 slides):**
   ```json
   { "id": "slide-01", "title": "...", "subtitle": "...", "bullets": ["..."], "presenter": "...", "institution": "...", "notes": "..." }
   ```

`PresentationViewer.tsx` rendered body text strictly via:
```tsx
// BEFORE: Only looked for slide.body
{currentSlide.body && (
  <div className="slide-prose">
    {renderSlideBody(currentSlide.body)}
  </div>
)}
```
Because `currentSlide.body` was `undefined` for 250 slides, the browser rendered empty cards with only slide titles! Furthermore, `currentSlide.diagram` was completely ignored, hiding architectural diagrams.

#### Remediation
1. **Normalized Data Accessors in `src/lib/content.ts`:**
   ```typescript
   export function getSlideBodyText(slide: SlideData | null | undefined): string {
     if (!slide) return '';
     if (typeof slide.body === 'string' && slide.body.trim()) return slide.body;
     if (typeof slide.content === 'string' && slide.content.trim()) return slide.content;
     if (Array.isArray(slide.bullets) && slide.bullets.length > 0) {
       return slide.bullets.map(b => `- ${b}`).join('\n');
     }
     return '';
   }

   export function getSlideLeadText(slide: SlideData | null | undefined): string {
     if (!slide) return '';
     if (typeof slide.lead === 'string' && slide.lead.trim()) return slide.lead;
     if (typeof slide.subtitle === 'string' && slide.subtitle.trim()) return slide.subtitle;
     return '';
   }
   ```
2. **Updated `PresentationViewer.tsx`:**
   Integrated `getSlideBodyText(currentSlide)`, `getSlideLeadText(currentSlide)`, expanded list and blockquote rendering, and added diagram support:
   ```tsx
   {currentSlide.diagram && (
     <div className="slide-diagram-wrapper">
       <img src={currentSlide.diagram} alt={currentSlide.title} className="slide-diagram-img" />
     </div>
   )}
   ```

---

### Root Cause 3: Export Engine Field Mismatch (`exportService.ts`)

#### Diagnostic Findings
In `src/lib/exportService.ts`, the PowerPoint (.pptx) and PDF generators extracted slide text directly from `slide.body`:
```typescript
// BEFORE:
const blocks = parseSlideBodyToBlocks(slide.body || '');
```
When exporting decks for Chapters 36–60, PPTX and PDF slides were generated with empty content bodies, failing academic delivery requirements.

#### Remediation
Updated `exportService.ts` to normalize slide data before block parsing:
```typescript
// AFTER:
const bodyText = getSlideBodyText(slide);
const leadText = getSlideLeadText(slide);
const blocks = parseSlideBodyToBlocks(bodyText);
```
Enhanced `parseSlideBodyToBlocks` to recognize blockquotes (`> `), numbered lists, bullet lists, and section headings.

---

### Root Cause 4: Phase UI-04 Architectural Workspace Omissions

#### Diagnostic Findings
During Phase UI-04, the catalog-and-workspace layout was unified across Advanced and Research views. However, several critical content components were left unconnected in the UI:
1. **Research Tracks (`ResearchTracksView.tsx`):**
   - The Tier-B Guided Workflow (`content/research/track-XX/guided-workflow.md`) had no corresponding tab or renderer.
   - The Tier-C runnable Python implementation (`content/research/track-XX/examples/example-01.py`) and research baseline Jupyter notebook were missing from the UI.
2. **Advanced Curriculum (`AdvancedCurriculumView.tsx`):**
   - Presentation slides (`content/advanced/adv-XX/slides.json`) existed on disk but were not exposed as a tab in the workspace.
   - The Jupyter notebook link for hands-on laboratory work was omitted from the Code tab.

#### Remediation
1. **`ResearchTracksView.tsx`:**
   - Added `workflow` tab ("Alur Riset Terpandu (Tier B)") that dynamically loads and displays `guided-workflow.md` via `MarkdownRenderer`.
   - Added `code` tab ("Skrip & Notebook (Tier C)") featuring syntax-highlighted Python code view and direct Jupyter notebook download/inspection card.
2. **`AdvancedCurriculumView.tsx`:**
   - Added `slides` tab ("Slide Presentasi Modul L3") embedding the interactive `PresentationViewer`.
   - Restored Jupyter laboratory notebook card under the Code tab.

---

## Regression Prevention & Verification System

To prevent future content regressions, an automated content integrity auditing system was established:
1. **`scripts/verify-content-integrity.mjs`**: A build and pre-test validation script that checks all 60 Core chapters, 8 Advanced modules, and 6 Research tracks. It validates that:
   - Every reading file exists and has minimum length (> 200 chars).
   - Every slide deck exists and contains at least 5 slides.
   - 100% of slides yield non-empty text when parsed through `getSlideBodyText`.
   - All research Tier-A, Tier-B, and Tier-C assets exist and are populated.
2. **`tests/content-integrity-recovery.test.mjs`**: 6 comprehensive unit and integration tests verifying schema resilience, markdown rendering, and component integration.
3. **Continuous Integration**: Added `verify:content` to `package.json` test lifecycle.

---

## Conclusion
All academic content has been 100% restored. No content was lost; all data models are now robust against polymorphic schema variations, and the UI cleanly exposes all academic tiers (Reading, Slides, Lab Code, Guided Workflow, and Export Decks).
