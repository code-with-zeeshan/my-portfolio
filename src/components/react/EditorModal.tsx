// src/components/react/EditorModal.tsx
"use client";

import React from "react";
import ReactIcon from "@/components/react/ReactIcon";

interface EditorModalProps {
  isOpen: boolean;
  title: string;
  fieldName: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
  editor?: "textarea" | "markdown";
  height?: number;
  placeholder?: string;
}

export default function EditorModal({
  isOpen,
  title,
  fieldName,
  value,
  onSave,
  onClose,
  saving,
  editor = "textarea",
  height = 300,
  placeholder = "",
}: EditorModalProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await onSave(localValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Edit {fieldName} — {title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          <ReactIcon name="x-close" size={14} />
          Close
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 p-6">
            {editor === "markdown" ? (
              <textarea
                rows={Math.round(height / 20)}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono text-zinc-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 resize-none"
                style={{ minHeight: height }}
                placeholder={placeholder}
              />
            ) : (
              <textarea
                rows={Math.round(height / 20)}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 resize-none"
                style={{ minHeight: height }}
                placeholder={placeholder}
              />
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
            >
              <ReactIcon name="check-circle" size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}