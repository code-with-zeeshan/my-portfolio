"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "card" | "image" | "circle";
  count?: number;
  className?: string;
}

export function Skeleton({ 
  variant = "text", 
  count = 1,
  className 
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-zinc-200 dark:bg-zinc-800";
  
  const variantStyles = {
    text: "h-4 rounded-md w-full",
    card: "h-48 rounded-2xl w-full",
    image: "h-64 rounded-xl w-full",
    circle: "h-12 w-12 rounded-full"
  };

  const skeletonItem = (index: number) => (
    <div
      key={index}
      className={cn(baseStyles, variantStyles[variant], className)}
    />
  );

  if (count === 1) {
    return skeletonItem(0);
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => skeletonItem(i))}
    </div>
  );
}

export default Skeleton;
