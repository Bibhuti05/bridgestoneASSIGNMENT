/**
 * seed-pexels.js
 * Fetches 30 popular portrait videos from Pexels and writes them to data/videos.json
 * Run with: node seed-pexels.js
 */

import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
  console.error('❌ Error: PEXELS_API_KEY environment variable is required.');
  console.error('   Usage: PEXELS_API_KEY=your_key node seed-pexels.js');
  process.exit(1);
}
const DATA_PATH = join(__dirname, "data", "videos.json");

// Pick the best SD portrait video file (prefer sd 540x960, fallback hd 1080x1920, then any)
function pickVideoUrl(videoFiles) {
  const portrait = videoFiles.filter(
    (f) => f.height > f.width, // portrait only
  );

  // prefer sd quality for speed
  const sd = portrait.find((f) => f.quality === "sd" && f.width === 540);
  if (sd) return sd.link;

  const anySD = portrait.find((f) => f.quality === "sd");
  if (anySD) return anySD.link;

  const anyHD = portrait.find((f) => f.quality === "hd");
  if (anyHD) return anyHD.link;

  // Fallback: first file
  return videoFiles[0]?.link ?? null;
}

// Derive a readable title from the Pexels URL slug
function titleFromUrl(url) {
  const match = url.match(/\/video\/([^/]+)\//);
  if (!match) return "Untitled";
  return match[1]
    .replace(/-/g, " ")
    .replace(/\d+$/, "")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .slice(0, 60);
}

async function fetchPage(page) {
  const url = `https://api.pexels.com/videos/popular?per_page=15&page=${page}&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });
  if (!res.ok)
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  console.log("🎬 Fetching Pexels videos...");

  // Read existing data to preserve likes/shares
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    // no existing file
  }
  const existingMap = Object.fromEntries(existing.map((v) => [v.id, v]));

  // Fetch 2 pages of 15 = 30 videos
  const [page1, page2] = await Promise.all([fetchPage(1), fetchPage(2)]);
  const rawVideos = [...page1.videos, ...page2.videos].slice(0, 30);

  const videos = rawVideos
    .map((v, idx) => {
      const videoUrl = pickVideoUrl(v.video_files);
      if (!videoUrl) return null;

      const id = `pex${v.id}`;
      const prev = existingMap[id] ?? {};

      return {
        id,
        title: titleFromUrl(v.url),
        description: `Shot by ${v.user?.name ?? "Pexels Creator"} · ${v.duration}s`,
        url: videoUrl,
        thumbnailUrl: v.image,
        pexelsUrl: v.url,
        duration: v.duration,
        width: v.width,
        height: v.height,
        likes: prev.likes ?? Math.floor(Math.random() * 400) + 20,
        likedBy: prev.likedBy ?? [],
        shares: prev.shares ?? Math.floor(Math.random() * 60) + 5,
      };
    })
    .filter(Boolean);

  writeFileSync(DATA_PATH, JSON.stringify(videos, null, 2));
  console.log(`✅ Saved ${videos.length} videos to data/videos.json`);
  videos.forEach((v, i) => console.log(`  ${i + 1}. [${v.id}] ${v.title}`));
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
