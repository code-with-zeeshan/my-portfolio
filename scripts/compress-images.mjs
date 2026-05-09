// scripts/compress-images.mjs
// Compress fallback images with a quality factor to reduce download size
import sharp from "sharp";
import { statSync, unlinkSync, renameSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..", "..");
const PUBLIC_DIR = join(__dirname, "public");
const QUALITY = 70; // WebP quality factor (0-100)
const PNG_QUALITY = 70; // PNG quality factor for manifest images

const images = [
  // Fallback images used in error handlers and static data
  { path: "images/profile.webp", quality: QUALITY },
  { path: "images/projects/sample_project.webp", quality: QUALITY },
  // Web app manifest images (used as PWA icons, large uncompressed PNGs)
  { path: "web-app-manifest-192x192.png", quality: PNG_QUALITY },
  { path: "web-app-manifest-512x512.png", quality: PNG_QUALITY },
];

async function compressImage(inputPath, quality) {
  const tempPath = inputPath + ".tmp";
  const originalSize = statSync(inputPath).size;
  const ext = inputPath.split(".").pop().toLowerCase();

  const sharpPipeline = sharp(inputPath);

  if (ext === "webp") {
    sharpPipeline.webp({ quality, effort: 6 });
  } else if (ext === "png") {
    sharpPipeline.png({ quality, compressionLevel: 9 });
  } else {
    sharpPipeline.webp({ quality, effort: 6 });
  }

  await sharpPipeline.toFile(tempPath);

  unlinkSync(inputPath);
  renameSync(tempPath, inputPath);

  const compressedSize = statSync(inputPath).size;
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  return {
    file: inputPath,
    original: originalSize,
    compressed: compressedSize,
    savings: `${savings}%`,
  };
}

async function main() {
  console.log(`\n🖼️  Compressing fallback images (quality=${QUALITY})...\n`);

  const results = [];
  for (const { path: img, quality } of images) {
    const fullPath = join(PUBLIC_DIR, img);
    try {
      const result = await compressImage(fullPath, quality);
      results.push(result);
      console.log(`  ✅ ${img}`);
      console.log(`     ${formatBytes(result.original)} → ${formatBytes(result.compressed)} (${result.savings} saved)\n`);
    } catch (err) {
      console.error(`  ❌ ${img}: ${err.message}\n`);
    }
  }

  console.log("📊 Summary:");
  const totalOriginal = results.reduce((s, r) => s + r.original, 0);
  const totalCompressed = results.reduce((s, r) => s + r.compressed, 0);
  const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);
  console.log(`  Total: ${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)} (${totalSavings}% reduction)\n`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

main().catch(console.error);
