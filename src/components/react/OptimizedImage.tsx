// src/components/react/OptimizedImage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cloudinaryPresets } from "@/lib/cloudinary";

interface Props {
  src: string | null | undefined;
  alt: string;
  preset?: keyof typeof cloudinaryPresets;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "auto" | "low";
  onErrorFallback?: string;
  avifPreset?: keyof typeof cloudinaryPresets;
  style?: React.CSSProperties;
  progressive?: boolean;
}

/**
 * Renders an image with AVIF <source> + WebP <source> + <img> fallback.
 * Handles Cloudinary URLs (applying presets) and local/static paths.
 * Centralises the 3-branch picture pattern duplicated across 6+ components.
 * Supports progressive loading with blur-up effect for Cloudinary images.
 */
export default function OptimizedImage({
  src,
  alt,
  preset = "projectThumbnail",
  fallbackSrc = "/images/projects/sample_project.webp",
  width,
  height,
  className = "",
  loading = "lazy",
  fetchPriority,
  onErrorFallback = "/images/projects/sample_project.webp",
  avifPreset,
  style,
  progressive = true,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const isCloudinary = src?.includes("cloudinary") ?? false;

  // Get the main image URL
  const imgSrc: string = isCloudinary
    ? cloudinaryPresets[preset]?.(src!) ?? src!
    : src || fallbackSrc;

  // Get blur placeholder for progressive loading (only for Cloudinary)
  const blurSrc: string | undefined = isCloudinary
    ? cloudinaryPresets.blurPlaceholder?.(src!)
    : undefined;

  const avifPresetKey = avifPreset ?? (`${preset}AVIF` as keyof typeof cloudinaryPresets);
  const imgSrcAVIF: string | undefined = isCloudinary
    ? cloudinaryPresets[avifPresetKey]?.(src!)
    : undefined;

  useEffect(() => {
    if (!isCloudinary || !progressive || !blurSrc) {
      setCurrentSrc(imgSrc);
      return;
    }

    // Start with blur placeholder
    setCurrentSrc(blurSrc);

    // Create an image to preload the high-quality version
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      setLoaded(true);
      // After fade transition, switch to high quality
      setTimeout(() => {
        setCurrentSrc(imgSrc);
      }, 300);
    };
  }, [imgSrc, blurSrc, isCloudinary, progressive]);

  const containerStyle: React.CSSProperties = {
    ...style,
    backgroundColor: isCloudinary && progressive && blurSrc ? '#f4f4f5' : undefined,
  };

  const imgElement = (
    <img
      src={currentSrc || imgSrc}
      alt={alt}
      className={`${className} ${loaded && isCloudinary && progressive ? 'opacity-100' : ''}`}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
      style={{
        ...containerStyle,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isCloudinary && progressive && !loaded ? 0.5 : 1,
      }}
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.errored) return;
        img.dataset.errored = "true";
        img.src = onErrorFallback;
      }}
    />
  );

  if (imgSrcAVIF) {
    return (
      <picture>
        <source srcSet={imgSrcAVIF} type="image/avif" />
        <source srcSet={imgSrc} type="image/webp" />
        {imgElement}
      </picture>
    );
  }

  return imgElement;
}