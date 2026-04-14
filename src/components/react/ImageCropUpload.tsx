// src/components/react/ImageCropUpload.tsx
// Admin-only crop uploader — wraps react-easy-crop + Cloudinary upload
// Gives full manual control: pan, zoom, aspect ratio choice
"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ─── Crop the image on a canvas and return a Blob ───
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputType: "image/jpeg" | "image/webp" = "image/webp"
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(resolve, outputType, 0.92);
    };
    image.onerror = () => resolve(null);
    image.src = imageSrc;
  });
}

type AspectPreset = "free" | "square" | "video" | "wide" | "portrait";

const ASPECT_PRESETS: Record<AspectPreset, number | undefined> = {
  free:    undefined,
  square:  1,
  video:   16 / 9,
  wide:    21 / 9,
  portrait: 4 / 5,
};

const ASPECT_LABELS: Record<AspectPreset, string> = {
  free:    "Free",
  square:  "1:1",
  video:   "16:9",
  wide:    "21:9",
  portrait: "4:5",
};

interface Props {
  folder:         string;
  label?:         string;
  hint?:          string;
  currentUrl?:    string | null;
  defaultAspect?: AspectPreset;
  onUpload:       (result: { url: string; publicId: string }) => void;
  onRemove?:      () => void;
}

export default function ImageCropUpload({
  folder,
  label        = "Upload Image",
  hint         = "PNG, JPG, WebP up to 10MB",
  currentUrl,
  defaultAspect = "free",
  onUpload,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Phase 1: select file ──
  const [rawSrc,    setRawSrc]    = useState<string | null>(null);
  const [fileName,  setFileName]  = useState("image");

  // ── Phase 2: crop ──
  const [crop,        setCrop]        = useState<Point>({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(1);
  const [aspectKey,   setAspectKey]   = useState<AspectPreset>(defaultAspect);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  // ── Phase 3: upload ──
  const [uploading,  setUploading]  = useState(false);
  const [preview,    setPreview]    = useState<string | null>(currentUrl || null);
  const [error,      setError]      = useState<string | null>(null);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);
    },
    []
  );

  // ── File selected → show crop UI ──
  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large — max 10 MB.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setRawSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // ── Confirm crop → upload ──
  const handleConfirmCrop = async () => {
    if (!rawSrc || !croppedArea) return;
    setUploading(true);
    setError(null);

    const blob = await getCroppedBlob(rawSrc, croppedArea);
    if (!blob) {
      setError("Crop failed — please try again.");
      setUploading(false);
      return;
    }

    // Convert blob to File so uploadToCloudinary accepts it
    const ext  = "webp";
    const file = new File([blob], `${fileName.replace(/\.[^.]+$/, "")}.${ext}`, {
      type: "image/webp",
    });

    const result = await uploadToCloudinary(file, folder, "image");
    setUploading(false);

    if (result) {
      URL.revokeObjectURL(rawSrc);
      setRawSrc(null);
      setPreview(result.url);
      onUpload(result);
    } else {
      setError("Upload failed — check Cloudinary config.");
    }
  };

  const aspect = ASPECT_PRESETS[aspectKey];

  // ────────────────────────────────────────────
  // RENDER: Crop UI (phase 2)
  // ────────────────────────────────────────────
  if (rawSrc) {
    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label} — Adjust crop
          </label>
        )}

        {/* ── Aspect ratio selector ── */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ASPECT_LABELS) as AspectPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAspectKey(key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                aspectKey === key
                  ? "bg-brand-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {ASPECT_LABELS[key]}
            </button>
          ))}
        </div>

        {/* ── Crop area ── */}
        <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900"
          style={{ height: 300 }}
        >
          <Cropper
            image={rawSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: "0.75rem" },
              cropAreaStyle:  { border: "2px solid var(--color-brand-500)" },
            }}
          />
        </div>

        {/* ── Zoom slider ── */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 w-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              <path d="M11 8v6"/><path d="M8 11h6"/>
            </svg>
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <span className="text-xs text-zinc-500 w-10 text-right">
            {zoom.toFixed(2)}×
          </span>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={uploading}
            className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
                  <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
                  <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
                  <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
                </svg>
                Uploading...
              </span>
            ) : (
              "✓ Crop & Upload"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(rawSrc);
              setRawSrc(null);
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────
  // RENDER: Drop zone / preview (phase 1 & 3)
  // ────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 hover:border-brand-400 transition-colors dark:border-zinc-700 dark:hover:border-brand-600 aspect-video"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              // ✅ B8: object-contain — never crops, always shows full image
              className="h-full w-full object-contain bg-zinc-100 dark:bg-zinc-800"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium text-white">Click to change & crop</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Click to select image
            </p>
            <p className="text-xs text-zinc-400">{hint}</p>
          </div>
        )}
      </div>

      {/* Remove button */}
      {preview && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onRemove();
          }}
          className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
        >
          Remove image
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}