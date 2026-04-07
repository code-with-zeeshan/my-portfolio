// src/components/react/CloudinaryUpload.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface UploadResult {
  url: string;
  publicId: string;
}

interface Props {
  onUpload: (result: UploadResult) => void;
  onRemove?: () => void;
  accept?: string;
  folder?: string;
  currentUrl?: string | null;
  label?: string;
  hint?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export default function CloudinaryUpload({
  onUpload,
  onRemove,
  accept = "image/*",
  folder = "portfolio",
  currentUrl,
  label = "Upload Image",
  hint = "PNG, JPG, WebP, GIF up to 10MB",
  aspectRatio = "video",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate progress (Cloudinary doesn't provide upload progress via fetch)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85));
    }, 200);

    const result = await uploadToCloudinary(file, folder);

    clearInterval(progressInterval);
    setProgress(100);

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
    }, 500);

    if (result) {
      setPreview(result.url);
      onUpload(result);
    } else {
      setError("Upload failed. Check Cloudinary configuration.");
    }
  }, [folder, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
            : "border-zinc-300 hover:border-brand-400 dark:border-zinc-700 dark:hover:border-brand-600"
        } ${aspectClasses[aspectRatio]}`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-sm font-medium text-white">Click to change</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{hint}</p>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <div className="w-3/4">
              <div className="mb-2 flex justify-between text-xs text-white">
                <span>Uploading to Cloudinary...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success indicator */}
      {preview && !uploading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
            {preview.includes("cloudinary") ? "Uploaded to Cloudinary CDN" : "Local preview"}
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPreview(null); onRemove?.(); }}
            className="text-xs text-zinc-400 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}