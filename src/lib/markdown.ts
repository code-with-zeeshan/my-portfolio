// src/lib/markdown.ts
// Unified markdown parser — replaces duplicate parsing logic across:
// - BlogPreviewModal.tsx
// - DynamicBlogPost.tsx
// - ProjectPreviewModal.tsx (uses simple split/join, can use this too)

/**
 * Parse markdown content to HTML
 * Supports: code blocks, inline code, headers (h1-h3), bold, italic, lists, links, horizontal rules, paragraphs
 * 
 * @param text - Raw markdown content
 * @returns HTML string with portfolio-appropriate styling
 */
export function parseMarkdown(text: string): string {
  if (!text) return "";

  return text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="rounded-xl bg-zinc-900 p-4 overflow-x-auto text-sm"><code class="text-zinc-100">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">$1</code>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-4">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-50">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-zinc-600 dark:text-zinc-300">• $1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-zinc-600 dark:text-zinc-300">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-zinc-200 dark:border-zinc-800 my-8" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs (double newline)
    .replace(/\n\n(?!<[h|p|u|o|l|p|c|h|b|i])/g, '</p><p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">')
    // Wrap in opening p if doesn't start with HTML tag
    .replace(/^(?!<)/, '<p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">')
    + '</p>';
}

/**
 * Simple markdown parser for inline/markdown-lite content
 * Useful for project descriptions or short content
 */
export function parseMarkdownLite(text: string): string {
  if (!text) return "";
  
  return text
    // Bold
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    )
    // Italic
    .replace(
      /\*(?!\s)([^*]+)\*(?!\*)/g,
      '<em>$1</em>'
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-brand-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Line breaks to paragraphs
    .replace(
      /\n\n/g,
      '</p><p class="mb-4">'
    )
    // Wrap in p if has content
    .replace(
      /^(.+)$/s,
      '<p class="mb-4">$1</p>'
    );
}

export default parseMarkdown;