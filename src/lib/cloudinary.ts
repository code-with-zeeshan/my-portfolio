// src/lib/cloudinary.ts
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_unsigned";
const API_KEY = import.meta.env.PUBLIC_CLOUDINARY_API_KEY || "";

// ─── Resource type determines which endpoint to use ────
type ResourceType = "image" | "video" | "raw" | "auto";

// ─── Upload a file to Cloudinary ───────────────────────
export async function uploadToCloudinary(
  file: File,
  folder: string = "portfolio",
  resourceType: ResourceType = "auto"   //  defaults to auto
): Promise<{ url: string; publicId: string } | null> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary not configured. Check your .env file.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  formData.append("api_key", API_KEY);
  formData.append("tags", folder);

  // auto = Cloudinary detects image/video/raw automatically
  // Use "raw" explicitly for PDFs/docs, "video" for audio/video
  formData.append("resource_type", resourceType);

  try {
    // Always use /auto/upload endpoint — resource_type in FormData controls behavior
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Cloudinary upload error:", err);
      return null;
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
}

// ─── Delete (informational only — requires signed requests) ───
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  console.info(`To delete image, remove from Cloudinary dashboard: ${publicId}`);
  return true;
}

// ─── Transform Options ─────────────────────────────────
interface TransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb" | "crop";
  gravity?: "auto" | "face" | "center";
  blur?: number;
  radius?: number | "max";
  aspectRatio?: string;
}

// ─── Build Optimized URL ───────────────────────────────
// f_auto and q_auto are applied here at the URL/delivery level
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options: TransformOptions = {}
): string {
  if (!CLOUD_NAME) return publicIdOrUrl;

  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes("cloudinary.com")) {
    const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) publicId = match[1].replace(/\.[^.]+$/, "");
  }

  if (publicIdOrUrl.startsWith("/") || !publicIdOrUrl.includes("cloudinary")) {
    return publicIdOrUrl;
  }

  const transforms: string[] = [];

  // f_auto & q_auto are delivery transformations — applied here in the URL
  // These URL params tell Cloudinary's CDN to serve WebP/AVIF to browsers that support it
  transforms.push(`f_${options.format ?? "auto"}`);
  transforms.push(`q_${options.quality ?? "auto"}`);

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  if (options.blur) transforms.push(`e_blur:${options.blur}`);
  if (options.radius) transforms.push(`r_${options.radius}`);
  if (options.aspectRatio) transforms.push(`ar_${options.aspectRatio}`);

  const transformStr = transforms.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

// ─── Preset URL builders ───────────────────────────────
export const cloudinaryPresets = {
  projectThumbnail: (url: string) =>
    getOptimizedUrl(url, { width: 800, height: 450, crop: "fill", gravity: "auto", format: "auto", quality: "auto" }),

  profilePhoto: (url: string) =>
    getOptimizedUrl(url, { width: 600, height: 600, crop: "thumb", gravity: "face", format: "auto", quality: "auto", radius: "max" }),

  blogHero: (url: string) =>
    getOptimizedUrl(url, { width: 1200, height: 630, crop: "fill", gravity: "auto", format: "auto", quality: "auto" }),

  ogImage: (url: string) =>
    getOptimizedUrl(url, { width: 1200, height: 630, crop: "fill", format: "auto", quality: "auto" }),

  blurPlaceholder: (url: string) =>
    getOptimizedUrl(url, { width: 20, quality: 30, blur: 1000, format: "auto" }),
};