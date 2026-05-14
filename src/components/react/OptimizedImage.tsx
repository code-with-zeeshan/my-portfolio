// src/components/react/OptimizedImage.tsx
import React from "react";
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
}

/**
 * Renders an image with AVIF <source> + WebP <source> + <img> fallback.
 * Handles Cloudinary URLs (applying presets) and local/static paths.
 * Centralises the 3-branch picture pattern duplicated across 6+ components.
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
}: Props) {
  const isCloudinary = src?.includes("cloudinary") ?? false;

  const imgSrc: string = isCloudinary
    ? cloudinaryPresets[preset]?.(src!) ?? src!
    : src || fallbackSrc;

  const avifPresetKey = avifPreset ?? (`${preset}AVIF` as keyof typeof cloudinaryPresets);
  const imgSrcAVIF: string | undefined = isCloudinary
    ? cloudinaryPresets[avifPresetKey]?.(src!)
    : undefined;

  const imgElement = (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
      style={style}
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