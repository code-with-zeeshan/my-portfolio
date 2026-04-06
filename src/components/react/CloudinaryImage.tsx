// src/components/react/CloudinaryImage.tsx
"use client";

import { useState } from "react";
import { cloudinaryPresets, getOptimizedUrl } from "@/lib/cloudinary";

type PresetName = keyof typeof cloudinaryPresets;

interface Props {
  src: string;
  alt: string;
  className?: string;
  preset?: PresetName;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  showBlurPlaceholder?: boolean;
}

export default function CloudinaryImage({
  src,
  alt,
  className = "",
  preset,
  width,
  height,
  loading = "lazy",
  showBlurPlaceholder = true,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Apply preset or custom dimensions
  const optimizedSrc = preset
    ? cloudinaryPresets[preset](src)
    : src.includes("cloudinary")
    ? getOptimizedUrl(src, { width, height, format: "auto", quality: "auto" })
    : src;

  // Blur placeholder URL (very small image for loading state)
  const blurSrc = showBlurPlaceholder && src.includes("cloudinary")
    ? cloudinaryPresets.blurPlaceholder(src)
    : null;

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurSrc && !isLoaded && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
        />
      )}

      {/* Main image */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}