// src/components/react/CloudinaryMultiUpload.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type ResourceType = "auto" | "image" | "video" | "raw";

interface UploadingFile {
  id: string;         // local temp id
  name: string;
  previewUrl: string; // local object URL for preview
  progress: number;   // 0-100
  done: boolean;
  error: boolean;
}

interface Props {
  folder: string;
  onUploadMany: (urls: string[]) => void;
  accept?: string;
  resourceType?: ResourceType;
  maxFiles?: number;
}

export default function CloudinaryMultiUpload({
  folder,
  onUploadMany,
  accept = "image/*",
  resourceType = "auto",
  maxFiles = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ── Update a single file's state by id ──
  const updateFile = useCallback(
    (id: string, patch: Partial<UploadingFile>) => {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
      );
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).slice(0, maxFiles);
      if (fileArray.length === 0) return;

      // ── Build preview entries immediately so user sees them ──
      const entries: UploadingFile[] = fileArray.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        done: false,
        error: false,
      }));

      setUploadingFiles((prev) => [...prev, ...entries]);
      setIsUploading(true);

      // ── Upload all files in parallel ──
      const results = await Promise.all(
        fileArray.map(async (file, i) => {
          const entry = entries[i];

          // Simulate progress ticks (Cloudinary fetch doesn't expose real progress)
          const ticker = setInterval(() => {
            updateFile(entry.id, {
              progress: Math.min(
                (Math.random() * 20) + 10, // random step 10–30%
                85
              ),
            });
          }, 300);

          try {
            const result = await uploadToCloudinary(file, folder, resourceType);
            clearInterval(ticker);

            if (result?.url) {
              updateFile(entry.id, { progress: 100, done: true });
              return result.url;
            } else {
              updateFile(entry.id, { progress: 0, error: true });
              return null;
            }
          } catch {
            clearInterval(ticker);
            updateFile(entry.id, { progress: 0, error: true });
            return null;
          }
        })
      );

      setIsUploading(false);

      const successUrls = results.filter((u): u is string => u !== null);
      if (successUrls.length > 0) {
        onUploadMany(successUrls);
      }

      // ── Clean up previews after short delay ──
      setTimeout(() => {
        entries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
        setUploadingFiles((prev) =>
          prev.filter((f) => !entries.find((e) => e.id === f.id))
        );
      }, 2500);
    },
    [folder, resourceType, maxFiles, onUploadMany, updateFile]
  );

  // ── Drag handlers ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">

      {/* ── Drop Zone ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-xl
          border-2 border-dashed p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[1.01]"
            : "border-zinc-300 hover:border-brand-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-brand-600 dark:hover:bg-zinc-800/50"
          }
          ${isUploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        {/* Upload icon */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          isDragging ? "bg-brand-500/20" : "bg-zinc-100 dark:bg-zinc-800"
        }`}>
          {isUploading ? (
            // Spinner during upload
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin text-brand-500"
            >
              <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
              <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
              <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
              <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isDragging ? "text-brand-500" : "text-zinc-500"}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
          )}
        </div>

        {/* Labels */}
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isUploading
              ? "Uploading to Cloudinary..."
              : isDragging
              ? "Drop images here!"
              : "Drag & drop multiple images, or click to browse"}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            PNG, JPG, WebP — up to {maxFiles} images at once
          </p>
        </div>
      </div>

      {/* ── Upload Progress Previews ── */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
            >
              {/* Image preview */}
              <img
                src={file.previewUrl}
                alt={file.name}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  file.done ? "opacity-100" : "opacity-60"
                }`}
              />

              {/* Progress overlay */}
              {!file.done && !file.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  {/* Circular-ish progress bar */}
                  <div className="w-3/4 h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white mt-1">{Math.round(file.progress)}%</p>
                </div>
              )}

              {/* Done checkmark */}
              {file.done && (
                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
              )}

              {/* Error state */}
              {file.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/60">
                  <p className="text-xs font-medium text-white">Failed</p>
                </div>
              )}

              {/* File name */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                <p className="text-[9px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input — multiple enabled */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          // Reset so same files can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}