export function renderMarkdown(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  const html: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;
  let inBlockquote = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const closeLists = () => {
    if (inUnorderedList) {
      html.push('</ul>');
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html.push('</ol>');
      inOrderedList = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push('</blockquote>');
      inBlockquote = false;
    }
  };

  for (const rawLine of lines) {
    if (rawLine.trim().startsWith('```')) {
      if (inCodeBlock) {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        closeLists();
        closeBlockquote();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const line = rawLine.trim();

    if (!line) {
      closeLists();
      closeBlockquote();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      closeBlockquote();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!inOrderedList) {
        closeBlockquote();
        if (inUnorderedList) {
          html.push('</ul>');
          inUnorderedList = false;
        }
        html.push('<ol>');
        inOrderedList = true;
      }
      html.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      if (!inUnorderedList) {
        closeBlockquote();
        if (inOrderedList) {
          html.push('</ol>');
          inOrderedList = false;
        }
        html.push('<ul>');
        inUnorderedList = true;
      }
      html.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      closeLists();
      if (!inBlockquote) {
        html.push('<blockquote>');
        inBlockquote = true;
      }
      html.push(`<p>${renderInlineMarkdown(quoteMatch[1])}</p>`);
      continue;
    }

    closeLists();
    closeBlockquote();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  if (inCodeBlock) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  closeLists();
  closeBlockquote();

  return html.join('');
}

function renderInlineMarkdown(value: string): string {
  let escaped = escapeHtml(value);

  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  escaped = escaped.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
  escaped = escaped.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');

  return escaped;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
