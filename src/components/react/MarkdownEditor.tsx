// src/components/react/MarkdownEditor.tsx
// SSR-safe Markdown editor — renders textarea fallback on server,
// full MDEditor on client after mount
"use client";

import { useState, useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  placeholder = "Write your content in Markdown...",
}: Props) {
  const [mounted, setMounted] = useState(false);
  // MDEditor is imported dynamically to avoid SSR crash
  // (it accesses window/document during module evaluation)
  const [MDEditor, setMDEditor] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detect dark mode
    setIsDark(document.documentElement.classList.contains("dark"));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Dynamically import to avoid SSR issues
    import("@uiw/react-md-editor").then((mod) => {
      setMDEditor(() => mod.default);
    });

    return () => observer.disconnect();
  }, []);

  // SSR / pre-mount fallback — plain textarea
  if (!mounted || !MDEditor) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={16}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono text-zinc-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 resize-y"
        style={{ minHeight: height }}
      />
    );
  }

  return (
    <div
      // ✅ Apply dark mode data attribute that @uiw/react-md-editor uses
      data-color-mode={isDark ? "dark" : "light"}
      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
    >
      <MDEditor
        value={value}
        onChange={(val: string | undefined) => onChange(val ?? "")}
        height={height}
        preview="live"
        visibleDragbar={false}
        textareaProps={{ placeholder }}
        style={{
          // Override MDEditor background to match portfolio theme
          backgroundColor: isDark ? "#18181b" : "#ffffff",
        }}
      />
    </div>
  );
}