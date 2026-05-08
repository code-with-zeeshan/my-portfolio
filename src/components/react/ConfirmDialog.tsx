// src/components/react/ConfirmDialog.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  const dialogContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="mt-4">
          <h3
            id="confirm-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </h3>
          <p
            id="confirm-message"
            className="mt-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            {message}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`
              rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
              ${
                variant === "danger"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-brand-500 hover:bg-brand-600"
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(dialogContent, document.body);
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [dialog, setDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const showConfirm = React.useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "danger" | "warning";
    }
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setDialog(null);
      },
      confirmLabel: options?.confirmLabel,
      cancelLabel: options?.cancelLabel,
      variant: options?.variant,
    });
  }, []);

  const hideConfirm = React.useCallback(() => {
    setDialog(null);
  }, []);

  const ConfirmDialogComponent = dialog ? (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      title={dialog.title}
      message={dialog.message}
      confirmLabel={dialog.confirmLabel}
      cancelLabel={dialog.cancelLabel}
      variant={dialog.variant}
      onConfirm={dialog.onConfirm}
      onCancel={hideConfirm}
    />
  ) : null;

  return { showConfirm, hideConfirm, ConfirmDialogComponent };
}
