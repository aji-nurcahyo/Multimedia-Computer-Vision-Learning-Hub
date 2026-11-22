import React, { useState, type ReactNode } from 'react';
import { MathView } from './MathView';

function FigureImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt || 'Diagram gagal dimuat'}
        style={{
          margin: '1.5rem auto',
          padding: '1.25rem',
          borderRadius: '10px',
          border: '1px dashed var(--border)',
          background: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}
      >
        Visual tidak dapat dimuat ({src}). {alt && <span>Deskripsi: {alt}</span>}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0 0.75rem' }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
      />
    </div>
  );
}

export function renderInlineText(text: string): ReactNode[] {
  if (!text) return [];

  // Regex splitting by:
  // 1. Display math ($$...$$ or \[...\])
  // 2. Inline math ($...$ or \(...\))
  // 3. Inline code (`...`)
  // 4. Link ([...](...))
  // 5. Bold+Italic (***...***)
  // 6. Bold (**...** or __...__)
  // 7. Italic (*...* or _..._)
  const parts = text.split(
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\\$|[^\$\n])+\$|\\\([\s\S]+?\\\)|\`[^\`\n]+\`|\[[^\]]+\]\([^\)]+\)|\*\*\*[^\*\n]+\*\*\*|\*\*[^\*\n]+\*\*|\*[^\*\n]+\*|__[^_\n]+__|(?<!\w)_[^_\n]+_(?!\w))/g
  );

  return parts.map((part, idx) => {
    if (!part) return null;

    // Display math in inline context ($$...$$ or \[...\])
    if (
      (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) ||
      (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4)
    ) {
      const math = part.slice(2, -2);
      return <MathView key={idx} math={math} displayMode={true} />;
    }

    // Inline math ($...$)
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const math = part.slice(1, -1);
      return <MathView key={idx} math={math} displayMode={false} />;
    }

    // Inline math with LaTeX delimiters (\(...\))
    if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
      const math = part.slice(2, -2);
      return <MathView key={idx} math={math} displayMode={false} />;
    }

    // Inline code (`...`)
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return <code key={idx}>{part.slice(1, -1)}</code>;
    }

    // Bold + Italic (***...***) - recursively parses inner content (e.g. math or code)
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={idx}>
          <em>{renderInlineText(part.slice(3, -3))}</em>
        </strong>
      );
    }

    // Bold (**...** or __...__) - recursively parses inner content
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      return <strong key={idx}>{renderInlineText(part.slice(2, -2))}</strong>;
    }

    // Italic (*...* or _..._) - recursively parses inner content
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      return <em key={idx}>{renderInlineText(part.slice(1, -1))}</em>;
    }

    // Link ([text](url)) - recursively parses link text
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (linkMatch) {
      return (
        <a key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
          {renderInlineText(linkMatch[1])}
        </a>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderListItemContent(lines: string[]): ReactNode {
  if (lines.length === 0) return null;
  if (lines.length === 1) {
    return renderInlineText(lines[0]);
  }

  const blocks: ReactNode[] = [];
  let currentPara: string[] = [];
  let currentNestedList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inMath = false;
  let mathBuf: string[] = [];

  const flushNestedList = () => {
    if (!currentNestedList || currentNestedList.items.length === 0) return;
    const ListTag = currentNestedList.type;
    const listKey = `nested-list-${blocks.length}`;
    blocks.push(
      <ListTag key={listKey}>
        {currentNestedList.items.map((it, idx) => (
          <li key={idx}>{renderInlineText(it)}</li>
        ))}
      </ListTag>
    );
    currentNestedList = null;
  };

  const flushPara = () => {
    if (currentPara.length === 0) return;
    const text = currentPara.join(' ');
    blocks.push(<p key={`p-${blocks.length}`}>{renderInlineText(text)}</p>);
    currentPara = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      flushPara();
      flushNestedList();
      continue;
    }

    // Display math single-line ($$...$$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      flushPara();
      flushNestedList();
      blocks.push(
        <div key={`math-${blocks.length}`} className="math-block">
          <MathView math={trimmed.slice(2, -2)} displayMode={true} />
        </div>
      );
      continue;
    }

    // Display math multi-line opener or closer
    if (inMath) {
      if (trimmed === '$$') {
        blocks.push(
          <div key={`math-${blocks.length}`} className="math-block">
            <MathView math={mathBuf.join('\n')} displayMode={true} />
          </div>
        );
        inMath = false;
        mathBuf = [];
        continue;
      }
      if (trimmed.endsWith('$$')) {
        const remaining = trimmed.slice(0, -2).trimEnd();
        if (remaining) mathBuf.push(remaining);
        blocks.push(
          <div key={`math-${blocks.length}`} className="math-block">
            <MathView math={mathBuf.join('\n')} displayMode={true} />
          </div>
        );
        inMath = false;
        mathBuf = [];
        continue;
      }
      mathBuf.push(raw);
      continue;
    } else {
      if (trimmed === '$$') {
        flushPara();
        flushNestedList();
        inMath = true;
        mathBuf = [];
        continue;
      }
      if (trimmed.startsWith('$$')) {
        flushPara();
        flushNestedList();
        inMath = true;
        const remaining = trimmed.slice(2).trimStart();
        mathBuf = remaining ? [remaining] : [];
        continue;
      }
    }

    // Nested unordered list (- or *)
    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (ulMatch && i > 0) {
      flushPara();
      if (!currentNestedList || currentNestedList.type !== 'ul') {
        flushNestedList();
        currentNestedList = { type: 'ul', items: [] };
      }
      currentNestedList.items.push(ulMatch[1]);
      continue;
    }

    // Nested ordered list
    const olMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    if (olMatch && i > 0) {
      flushPara();
      if (!currentNestedList || currentNestedList.type !== 'ol') {
        flushNestedList();
        currentNestedList = { type: 'ol', items: [] };
      }
      currentNestedList.items.push(olMatch[2]);
      continue;
    }

    // Normal text line
    flushNestedList();
    currentPara.push(trimmed);
  }

  flushPara();
  flushNestedList();
  if (inMath && mathBuf.length > 0) {
    blocks.push(
      <div key={`math-${blocks.length}`} className="math-block">
        <MathView math={mathBuf.join('\n')} displayMode={true} />
      </div>
    );
  }

  return <>{blocks}</>;
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: ReactNode[] = [];

  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  let inMathBlock = false;
  let mathBuffer: string[] = [];

  let inList = false;
  let currentList: {
    type: 'ol' | 'ul';
    start: number;
    items: { order?: number; lines: string[] }[];
  } | null = null;

  let inTable = false;
  let tableRows: string[][] = [];

  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  let paragraphBuffer: string[] = [];
  let lastWasImage = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const fullParagraphText = paragraphBuffer.join(' ');
    elements.push(
      <p key={`p-${elements.length}`}>{renderInlineText(fullParagraphText)}</p>
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!inList || !currentList || currentList.items.length === 0) {
      inList = false;
      currentList = null;
      return;
    }

    const isOl = currentList.type === 'ol';
    const ListTag = isOl ? 'ol' : 'ul';
    const listStart = currentList.start;
    const listKey = `list-${elements.length}`;

    elements.push(
      <ListTag key={listKey} start={isOl ? listStart : undefined}>
        {currentList.items.map((item, idx) => (
          <li key={idx} value={item.order}>
            {renderListItemContent(item.lines)}
          </li>
        ))}
      </ListTag>
    );

    inList = false;
    currentList = null;
  };

  const flushBlockquote = () => {
    if (!inBlockquote) return;
    elements.push(
      <blockquote key={`quote-${elements.length}`}>
        {blockquoteBuffer.map((line, idx) => (
          <div key={idx} style={{ margin: idx > 0 ? '0.35rem 0 0' : 0 }}>
            {renderInlineText(line)}
          </div>
        ))}
      </blockquote>
    );
    inBlockquote = false;
    blockquoteBuffer = [];
  };

  const flushTable = () => {
    if (!inTable) return;
    if (tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      elements.push(
        <div key={`table-${elements.length}`} className="table-wrapper">
          <table>
            <thead>
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx}>{renderInlineText(cell.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInlineText(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableRows = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushBlockquote();
    flushTable();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block delimiters (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushAll();
        elements.push(
          <div key={`code-${elements.length}`} style={{ position: 'relative', margin: '1.5rem 0' }}>
            {codeLang && (
              <span
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {codeLang}
              </span>
            )}
            <pre>
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        flushAll();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      lastWasImage = false;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Display Math ($$...$$) multi-line block delimiter and handlers
    if (inMathBlock) {
      if (trimmed === '$$') {
        flushAll();
        elements.push(
          <div key={`math-${elements.length}`} className="math-block">
            <MathView math={mathBuffer.join('\n')} displayMode={true} />
          </div>
        );
        inMathBlock = false;
        mathBuffer = [];
        lastWasImage = false;
        continue;
      }
      if (trimmed.endsWith('$$')) {
        const remaining = trimmed.slice(0, -2).trimEnd();
        if (remaining) mathBuffer.push(remaining);
        flushAll();
        elements.push(
          <div key={`math-${elements.length}`} className="math-block">
            <MathView math={mathBuffer.join('\n')} displayMode={true} />
          </div>
        );
        inMathBlock = false;
        mathBuffer = [];
        lastWasImage = false;
        continue;
      }
      mathBuffer.push(rawLine);
      continue;
    }

    // Display Math single-line ($$...$$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      flushAll();
      elements.push(
        <div key={`math-${elements.length}`} className="math-block">
          <MathView math={trimmed.slice(2, -2)} displayMode={true} />
        </div>
      );
      lastWasImage = false;
      continue;
    }

    // Display Math opener ($$)
    if (trimmed === '$$') {
      flushAll();
      inMathBlock = true;
      mathBuffer = [];
      lastWasImage = false;
      continue;
    }

    if (trimmed.startsWith('$$')) {
      flushAll();
      inMathBlock = true;
      const remaining = trimmed.slice(2).trimStart();
      mathBuffer = remaining ? [remaining] : [];
      lastWasImage = false;
      continue;
    }

    // Markdown Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      flushList();
      flushBlockquote();
      if (/^\|(\s*[-:]+[-| :]*)\|$/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      lastWasImage = false;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line handling
    if (!trimmed) {
      if (inList && currentList) {
        // Peek ahead to see if list continues (loose list)
        let listContinues = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();
          if (!nextTrimmed) continue;
          const nextRaw = lines[j];
          const isNextIndented = /^(\s{2,}|\t)/.test(nextRaw);
          const isNextUl = /^[-*]\s+/.test(nextTrimmed);
          const isNextOl = /^(\d+)\.\s+/.test(nextTrimmed);
          if (
            isNextIndented ||
            (currentList.type === 'ol' && isNextOl) ||
            (currentList.type === 'ul' && isNextUl)
          ) {
            listContinues = true;
          }
          break;
        }

        if (listContinues) {
          continue;
        } else {
          flushAll();
        }
      } else {
        flushAll();
      }
      lastWasImage = false;
      continue;
    }

    // If currently in a list, check for indented continuation content
    const isIndented = /^(\s{2,}|\t)/.test(rawLine);
    if (inList && currentList && isIndented) {
      const activeItem = currentList.items[currentList.items.length - 1];
      if (activeItem) {
        activeItem.lines.push(rawLine.trim());
        continue;
      }
    }

    // Blockquote (> ...)
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      flushTable();
      inBlockquote = true;
      blockquoteBuffer.push(trimmed.slice(2).trim());
      lastWasImage = false;
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushAll();
      elements.push(<h1 key={`h1-${elements.length}`}>{renderInlineText(trimmed.slice(2))}</h1>);
      lastWasImage = false;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushAll();
      elements.push(<h2 key={`h2-${elements.length}`}>{renderInlineText(trimmed.slice(3))}</h2>);
      lastWasImage = false;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushAll();
      elements.push(<h3 key={`h3-${elements.length}`}>{renderInlineText(trimmed.slice(4))}</h3>);
      lastWasImage = false;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushAll();
      elements.push(<h4 key={`h4-${elements.length}`}>{renderInlineText(trimmed.slice(5))}</h4>);
      lastWasImage = false;
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      flushAll();
      elements.push(<hr key={`hr-${elements.length}`} />);
      lastWasImage = false;
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (ulMatch) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      if (inList && currentList && currentList.type === 'ul') {
        currentList.items.push({ lines: [ulMatch[1]] });
      } else {
        flushList();
        inList = true;
        currentList = {
          type: 'ul',
          start: 1,
          items: [{ lines: [ulMatch[1]] }],
        };
      }
      lastWasImage = false;
      continue;
    }

    // Ordered List (1. 2.)
    const olMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    if (olMatch) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      const num = parseInt(olMatch[1], 10);
      if (inList && currentList && currentList.type === 'ol') {
        currentList.items.push({ order: num, lines: [olMatch[2]] });
      } else {
        flushList();
        inList = true;
        currentList = {
          type: 'ol',
          start: num,
          items: [{ order: num, lines: [olMatch[2]] }],
        };
      }
      lastWasImage = false;
      continue;
    }

    // Not a list item anymore
    if (inList) {
      flushList();
    }

    // Image (![alt](url))
    const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (imgMatch) {
      flushParagraph();
      elements.push(<FigureImage key={`img-${elements.length}`} src={imgMatch[2]} alt={imgMatch[1]} />);
      lastWasImage = true;
      continue;
    }

    // Figure Caption detection:
    // 1) Explicit figure caption pattern: *Gambar ...* or *Figure ...* or *Diagram ...* or *Tabel ...*
    // 2) Or if immediately preceded by an image and wrapped in single asterisks *...*
    const isExplicitCaption = /^\*(?:Gambar|Figure|Diagram|Bagan|Tabel)\s+[\d\.]+.*\*$/i.test(trimmed);
    const isImageCaptionFollowup =
      lastWasImage && trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.slice(1, -1).includes('*');

    if (isExplicitCaption || isImageCaptionFollowup) {
      flushParagraph();
      const captionText = trimmed.slice(1, -1).trim();
      elements.push(
        <p key={`caption-${elements.length}`} className="figure-caption">
          {renderInlineText(captionText)}
        </p>
      );
      lastWasImage = false;
      continue;
    }

    lastWasImage = false;

    // Normal paragraph line: buffer contiguous lines for natural text flow
    paragraphBuffer.push(trimmed);
  }

  flushAll();

  return <div className="prose">{elements}</div>;
}
