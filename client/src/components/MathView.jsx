import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * MathView renders mathematical expressions using KaTeX.
 * Supports inline and display modes, with graceful fallback to plain text if syntax fails.
 */
export default function MathView({ math = '', inline = false, className = '' }) {
  const html = useMemo(() => {
    if (!math || typeof math !== 'string') return '';
    try {
      // Remove enclosing $ or $$ if provided
      let cleanMath = math.trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      return katex.renderToString(cleanMath, {
        displayMode: !inline,
        throwOnError: false,
        trust: true,
      });
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
      return `<span class="font-mono text-xs text-red-400">${math}</span>`;
    }
  }, [math, inline]);

  if (!math) return null;

  return (
    <span
      className={`katex-render ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
