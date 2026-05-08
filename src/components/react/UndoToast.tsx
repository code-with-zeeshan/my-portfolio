// src/components/react/UndoToast.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface UndoToastProps {
  message: string;
  actionLabel?: string;
  duration?: number;
  onUndo: () => void | Promise<void>;
  onClose: () => void;
}

export function UndoToast({ message, actionLabel = "Undo", duration = 5000, onUndo, onClose }: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  const handleUndo = useCallback(() => {
    setIsVisible(false);
    onUndo();
  }, [onUndo]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percentage = (remaining / duration) * 100;
      setProgress(percentage);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    };

    const frame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frame);
  }, [duration, onClose]);

  const portalContent = (
    <div
      className={`fixed bottom-4 right-4 z-9999 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-brand-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              className="rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
            >
              {actionLabel}
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(portalContent, document.body);
}

interface UndoAction {
  message: string;
  actionLabel?: string;
  duration?: number;
  onUndo: () => void | Promise<void>;
}

// Use a Map to track active toasts by container ID (fixes module-level variable issue)
const activeToasts = new Map<HTMLElement, (() => void)>();

export function showUndoToast({ message, actionLabel, duration, onUndo }: UndoAction) {
  // Clean up any existing toast
  activeToasts.forEach((cleanup, container) => {
    cleanup();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  activeToasts.clear();

  const container = document.createElement("div");
  container.id = "undo-toast-container";
  document.body.appendChild(container);

  let undoCompleted = false;

  const handleUndo = async () => {
    undoCompleted = true;
    await onUndo();
    cleanup();
  };

  const handleClose = () => {
    cleanup();
  };

  const cleanup = () => {
    const cleanupFn = activeToasts.get(container);
    if (cleanupFn) {
      cleanupFn();
      activeToasts.delete(container);
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  const Root = () => (
    <UndoToast
      message={message}
      actionLabel={actionLabel}
      duration={duration}
      onUndo={handleUndo}
      onClose={handleClose}
    />
  );

  // Store cleanup function on container for tracking
  const cleanupFn = () => {
    const ReactDOM = (window as any).ReactDOM;
    if (ReactDOM && ReactDOM.unmountComponentAtNode) {
      ReactDOM.unmountComponentAtNode(container);
    }
  };

  // Use ReactDOM from react-dom/client if available (React 18+)
  // Otherwise fallback to ReactDOM.render (React 17)
  const ReactDOM = (window as any).ReactDOM;
  if (ReactDOM && ReactDOM.createRoot) {
    const root = ReactDOM.createRoot(container);
    root.render(<Root />);
    activeToasts.set(container, () => {
      root.unmount();
    });
  } else if (ReactDOM && ReactDOM.render) {
    ReactDOM.render(<Root />, container);
    activeToasts.set(container, cleanupFn);
  } else {
    // Last resort: try importing from react-dom dynamically
    import("react-dom/client").then((mod) => {
      if (mod.createRoot) {
        const root = mod.createRoot(container);
        root.render(<Root />);
        activeToasts.set(container, () => {
          root.unmount();
        });
      }
    }).catch(() => {
      import("react-dom").then((mod) => {
        if (mod.render) {
          mod.render(<Root />, container);
          activeToasts.set(container, cleanupFn);
        }
      });
    });
    // For dynamically loaded ReactDOM, we'll set a placeholder cleanup
    activeToasts.set(container, cleanupFn);
  }
}
