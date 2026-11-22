import { useMemo } from 'react';
import katex from 'katex';

export function MathView({ math, displayMode = false }: { math: string; displayMode?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return `<code>${math}</code>`;
    }
  }, [math, displayMode]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

