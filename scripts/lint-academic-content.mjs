import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';

/**
 * Academic Content & Mathematical Notation Linter
 * Multimedia & Computer Vision Learning Hub - ITERA
 *
 * Markdown-aware, KaTeX-validated, non-destructive quality checker
 * for Core Curriculum, Advanced Modules, Research Tracks, and Presentations.
 */

function getFiles(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, exts));
    } else {
      if (exts.some((ext) => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const LATEX_KEYWORDS = [
  'frac',
  'sum',
  'int',
  'partial',
  'mathbf',
  'sqrt',
  'sigma',
  'lambda',
  'theta',
  'alpha',
  'beta',
  'gamma',
  'cdot',
  'times',
  'infty',
  'approx',
  'neq',
  'leq',
  'geq',
  'forall',
  'exists',
  'nabla',
];

export function lintAcademicContent(options = {}) {
  const targetDirs = options.dirs || ['content/chapters', 'content/advanced', 'content/research'];
  const exts = options.exts || ['.md', '.json'];

  let allFiles = [];
  targetDirs.forEach((d) => {
    allFiles = allFiles.concat(getFiles(d, exts));
  });

  const findings = [];
  let totalFormulas = 0;

  allFiles.forEach((file) => {
    const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    // 1. JSON Structural & Content Inspection
    if (file.endsWith('.json')) {
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        findings.push({
          file: relPath,
          line: 1,
          severity: 'ERROR',
          defectClass: 'R1',
          code: 'INVALID_JSON_SYNTAX',
          message: `JSON parse failure: ${err.message}`,
          suggestion: 'Fix malformed JSON syntax and ensure all backslashes are escaped.',
          snippet: content.slice(0, 100),
        });
        return;
      }

      // If it is slides.json, audit slide bodies and titles
      if (Array.isArray(parsed) && file.includes('slides.json')) {
        parsed.forEach((slide, sIdx) => {
          const slideNum = sIdx + 1;
          const textsToCheck = [
            { field: 'title', val: slide.title },
            { field: 'body', val: slide.body },
            { field: 'notes', val: slide.notes },
          ];

          textsToCheck.forEach(({ field, val }) => {
            if (!val || typeof val !== 'string') return;

            // Test KaTeX formulas inside slide
            const slideMathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?:\\\$|[^\$\n])+\$)/g;
            let sm;
            while ((sm = slideMathRegex.exec(val)) !== null) {
              totalFormulas++;
              const raw = sm[1];
              let math = '';
              let isDisplay = false;
              if (raw.startsWith('$$') && raw.endsWith('$$')) {
                math = raw.slice(2, -2).trim();
                isDisplay = true;
              } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
                math = raw.slice(2, -2).trim();
                isDisplay = true;
              } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
                math = raw.slice(2, -2).trim();
              } else if (raw.startsWith('$') && raw.endsWith('$')) {
                math = raw.slice(1, -1).trim();
              }

              if (!math) continue;

              if (math.includes('\u2013') || math.includes('\u2014')) {
                findings.push({
                  file: relPath,
                  line: slideNum,
                  severity: 'WARNING',
                  defectClass: 'C3',
                  code: 'UNICODE_DASH_IN_MATH',
                  message: `Slide ${slideNum} math formula contains Unicode dash (en-dash or em-dash)`,
                  suggestion: 'Replace Unicode dash with standard ASCII minus (-).',
                  math: math.slice(0, 80),
                  snippet: raw.slice(0, 100),
                });
              }

      try {
                katex.renderToString(math, { displayMode: isDisplay, throwOnError: true });
              } catch (e) {
                findings.push({
                  file: relPath,
                  line: sIdx + 1,
                  severity: 'ERROR',
                  defectClass: 'C1',
                  code: 'KATEX_SYNTAX_ERROR_IN_SLIDE',
                  message: `KaTeX syntax error in slide ${slideNum} (${field}): ${e.message}`,
                  suggestion: 'Correct mathematical expression syntax.',
                  math: math.slice(0, 80),
                  snippet: raw.slice(0, 100),
                });
              }
            }

            // Check for discrete signal notation x(n) in slides
            if (/\bx\(n\)/.test(val)) {
              findings.push({
                file: relPath,
                line: sIdx + 1,
                severity: 'WARNING',
                defectClass: 'C2',
                code: 'DISCRETE_SIGNAL_NOTATION',
                message: `Slide ${slideNum} uses x(n) instead of standardized x[n]`,
                suggestion: 'Replace x(n) with x[n] for discrete-time signal notation.',
                snippet: val.slice(0, 80),
              });
            }
          });
        });
      }
      return;
    }

    // 2. Markdown File Inspection
    const lines = content.split(/\r?\n/);
    let inCodeBlock = false;
    let inMathBlock = false;

    // First: extract and test all KaTeX formulas in the file (excluding code blocks)
    let textWithoutCode = '';
    let codeFence = false;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const trimmed = l.trim();
      if (trimmed.startsWith('```')) {
        codeFence = !codeFence;
        textWithoutCode += '\n';
        continue;
      }
      if (codeFence) {
        textWithoutCode += '\n';
      } else {
        textWithoutCode += l + '\n';
      }
    }

    const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?:\\\$|[^\$\n])+\$)/g;
    let m;
    while ((m = mathRegex.exec(textWithoutCode)) !== null) {
      totalFormulas++;
      const raw = m[1];
      let math = '';
      let isDisplay = false;
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        math = raw.slice(2, -2).trim();
        isDisplay = true;
      } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
        math = raw.slice(2, -2).trim();
        isDisplay = true;
      } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
        math = raw.slice(2, -2).trim();
      } else if (raw.startsWith('$') && raw.endsWith('$')) {
        math = raw.slice(1, -1).trim();
      }

      if (!math) continue;

      if (math.includes('\u2013') || math.includes('\u2014')) {
        const lineNum = textWithoutCode.slice(0, m.index).split('\n').length;
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'C3',
          code: 'UNICODE_DASH_IN_MATH',
          message: 'Unicode dash (en-dash or em-dash) found inside math formula',
          suggestion: 'Replace Unicode dash with standard ASCII minus (-).',
          math: math.slice(0, 80),
          snippet: raw.slice(0, 100),
        });
      }

      try {
        katex.renderToString(math, { displayMode: isDisplay, throwOnError: true });
      } catch (e) {
        const lineNum = textWithoutCode.slice(0, m.index).split('\n').length;
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'ERROR',
          defectClass: 'C1',
          code: 'KATEX_FORMULA_SYNTAX_ERROR',
          message: `KaTeX formula error: ${e.message}`,
          suggestion: 'Fix LaTeX formula syntax or replace invalid commands.',
          math: math.slice(0, 80),
          snippet: raw.slice(0, 100),
        });
      }
    }

    // Line-by-line inspection
    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Check for display math unseparated openers ($$ glued to expression)
      if (trimmed.startsWith('$$') && !trimmed.endsWith('$$') && trimmed.length > 2 && !inCodeBlock) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'R1',
          code: 'UNSEPARATED_DISPLAY_MATH_OPENER',
          message: 'Multi-line display math opener $$ should be placed on its own line',
          suggestion: 'Move content after $$ to the next line.',
          snippet: trimmed.slice(0, 80),
        });
      }

      // Check for display math unseparated closers (expression glued to $$)
      if (!trimmed.startsWith('$$') && trimmed.endsWith('$$') && !trimmed.startsWith('$') && trimmed.length > 2 && !inCodeBlock) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'R1',
          code: 'UNSEPARATED_DISPLAY_MATH_CLOSER',
          message: 'Multi-line display math closer $$ should be placed on its own line',
          suggestion: 'Move $$ to its own separate closing line.',
          snippet: trimmed.slice(0, 80),
        });
      }

      if (trimmed === '$$') {
        inMathBlock = !inMathBlock;
        continue;
      }
      if (inCodeBlock || inMathBlock) continue;

      // Check for HTML entities inside LaTeX math
      const mathOnLine = rawLine.match(/(\$\$[\s\S]+?\$\$|(?<!\\)\$(?:\\\$|[^\$\n])+\$)/g) || [];
      for (const formula of mathOnLine) {
        if (/&(?:amp|lt|gt|quot);/.test(formula)) {
          findings.push({
            file: relPath,
            line: lineNum,
            severity: 'ERROR',
            defectClass: 'R2',
            code: 'HTML_ENTITY_INSIDE_MATH',
            message: 'HTML entity found inside LaTeX mathematical formula (e.g. &amp;, &lt;, &gt;)',
            suggestion: 'Use genuine LaTeX operators: replace &amp; with &, &lt; with <, &gt; with >.',
            snippet: formula.slice(0, 80),
          });
        }
      }

      // Remove inline code
      const withoutCode = rawLine.replace(/`[^`\n]+`/g, '');

      // Remove inline and display math
      const cleanLine = withoutCode
        .replace(/\$\$[\s\S]+?\$\$/g, '')
        .replace(/\\\[[\s\S]+?\\\]/g, '')
        .replace(/\$(?:\\\$|[^\$\n])+\$/g, '')
        .replace(/\\\([\s\S]+?\\\)/g, '');

      // Check for raw LaTeX commands leaking outside math mode
      for (const kw of LATEX_KEYWORDS) {
        const regex = new RegExp(`\\\\${kw}(?![a-zA-Z])`, 'g');
        if (regex.test(cleanLine)) {
          findings.push({
            file: relPath,
            line: lineNum,
            severity: 'ERROR',
            defectClass: 'R2',
            code: 'RAW_LATEX_OUTSIDE_MATH',
            message: `Raw LaTeX command \\${kw} detected outside math delimiters`,
            suggestion: `Enclose mathematical expression containing \\${kw} in $...$ or $$...$$.`,
            snippet: trimmed.slice(0, 80),
          });
        }
      }

      // Check for unbalanced unescaped $ on a single line
      const dollarMatches = cleanLine.match(/(?<!\\)\$/g);
      if (dollarMatches && dollarMatches.length % 2 !== 0) {
        // Exclude currency and bash variables
        if (!/\$(?:[A-Z_]+|[0-9]+|schema)/.test(cleanLine)) {
          findings.push({
            file: relPath,
            line: lineNum,
            severity: 'WARNING',
            defectClass: 'R2',
            code: 'UNBALANCED_DOLLAR_DELIMITER',
            message: `Unbalanced unescaped dollar delimiter ($) found (${dollarMatches.length} on line)`,
            suggestion: 'Ensure mathematical dollar delimiters open and close properly on the same line.',
            snippet: trimmed.slice(0, 80),
          });
        }
      }

      // Check for discrete signal notation x(n) -> should be x[n]
      if (/\bx\(n\)/.test(rawLine) && !rawLine.includes('def x(n)') && !rawLine.includes('range(')) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'C2',
          code: 'DISCRETE_SIGNAL_NOTATION',
          message: 'Discrete-time signal written with parentheses x(n) instead of brackets x[n]',
          suggestion: 'Standardize to discrete signal notation x[n].',
          snippet: trimmed.slice(0, 80),
        });
      }

      // Check for continuous signal notation x[t] -> should be x(t)
      if (/\bx\[t\]/.test(rawLine)) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'C2',
          code: 'CONTINUOUS_SIGNAL_NOTATION',
          message: 'Continuous-time signal written with brackets x[t] instead of parentheses x(t)',
          suggestion: 'Standardize to continuous signal notation x(t).',
          snippet: trimmed.slice(0, 80),
        });
      }

      // Check for conditional probability with bare pipe P(A|B) -> P(A \mid B)
      if (/\$[^$\n]*P\([^$|\n]+\|[^$\n]+\)[^$\n]*\$/.test(rawLine) && !rawLine.includes('\\mid')) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'INFO',
          defectClass: 'C2',
          code: 'CONDITIONAL_PROBABILITY_NOTATION',
          message: 'Conditional probability written with bare pipe | instead of LaTeX \\mid',
          suggestion: 'Use P(A \\mid B) for correct typographic spacing in KaTeX.',
          snippet: trimmed.slice(0, 80),
        });
      }

      // Check for unnecessary decorative arrows e.g. ==> or ---> in academic text
      if (/(?:==>|--->|<===)/.test(rawLine)) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'C3',
          code: 'UNNECESSARY_DECORATIVE_ARROWS',
          message: 'Unnecessary informal text arrow (==> or --->) in academic explanation',
          suggestion: 'Use formal Indonesian text or standard LaTeX \\implies / \\rightarrow.',
          snippet: trimmed.slice(0, 80),
        });
      }

      // Check for malformed markdown emphasis e.g. ****
      if (/\*{4,}/.test(rawLine) && !trimmed.startsWith('***')) {
        findings.push({
          file: relPath,
          line: lineNum,
          severity: 'WARNING',
          defectClass: 'C4',
          code: 'MALFORMED_MARKDOWN_EMPHASIS',
          message: 'Malformed markdown asterisks (4 or more contiguous asterisks)',
          suggestion: 'Clean up redundant asterisks.',
          snippet: trimmed.slice(0, 80),
        });
      }
    }
  });

  const errors = findings.filter((f) => f.severity === 'ERROR');
  const warnings = findings.filter((f) => f.severity === 'WARNING');
  const infos = findings.filter((f) => f.severity === 'INFO');

  return {
    totalFilesAudited: allFiles.length,
    totalFormulasScanned: totalFormulas,
    findings,
    errors,
    warnings,
    infos,
  };
}

// CLI Execution Entry Point
if (process.argv[1] && process.argv[1].endsWith('lint-academic-content.mjs')) {
  console.log('================================================================');
  console.log('  ACADEMIC CONTENT & MATHEMATICAL NOTATION LINTER (PHASE UI-03)');
  console.log('  Multimedia & Computer Vision Learning Hub · ITERA');
  console.log('================================================================\n');

  const result = lintAcademicContent();

  console.log(`Audited: ${result.totalFilesAudited} files`);
  console.log(`Validated: ${result.totalFormulasScanned} formulas via KaTeX`);
  console.log(`Total Findings: ${result.findings.length} (${result.errors.length} ERROR, ${result.warnings.length} WARNING, ${result.infos.length} INFO)\n`);

  if (result.findings.length > 0) {
    console.log('--- DETAILED FINDINGS ---');
    result.findings.forEach((f) => {
      console.log(`[${f.severity}] [${f.defectClass}] ${f.file}:${f.line} (${f.code})`);
      console.log(`  Message: ${f.message}`);
      console.log(`  Suggestion: ${f.suggestion}`);
      console.log(`  Snippet: ${f.snippet}\n`);
    });
  }

  // Save audit manifest
  const manifestPath = 'docs/UI_03_CONTENT_AUDIT_MANIFEST.json';
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        phase: 'UI-03',
        status: result.errors.length === 0 ? 'PASSED' : 'FAILED',
        auditDate: new Date().toISOString(),
        summary: {
          totalFilesAudited: result.totalFilesAudited,
          validatedFormulas: result.totalFormulasScanned,
          totalFindings: result.findings.length,
          errors: result.errors.length,
          warnings: result.warnings.length,
          infos: result.infos.length,
        },
        findings: result.findings,
      },
      null,
      2
    )
  );
  console.log(`Audit report manifest saved to ${manifestPath}`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Linter completed with ${result.errors.length} ERROR(s).`);
    process.exit(1);
  } else {
    console.log('\n✔ Academic content and mathematical notation validation PASSED.');
    process.exit(0);
  }
}
