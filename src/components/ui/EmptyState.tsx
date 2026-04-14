"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon = "folder",
  title = "No items found",
  description = "Check back later for updates",
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-16 text-center",
      className
    )}>
      <div className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7h-9l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-4">
        {description}
      </p>
      {children}
    </div>
  );
}

export default EmptyState;
