#!/usr/bin/env node
/**
 * Derives every NORYX brand asset used by the app from the official logo file.
 *
 * The master in brand/source is a transparent stacked lockup (X monogram above
 * the NORYX wordmark), cut out of the supplied mock-up in brand/original. This
 * script only crops, pads and resizes that artwork — it never redraws it.
 * Re-run it whenever the master changes:
 *
 *   npm run brand:assets
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "brand", "source");
const publicBrandDir = path.join(root, "public", "brand");
const appDir = path.join(root, "src", "app");

/** Pixels at or below this alpha are treated as anti-aliasing noise when measuring bounds. */
const ALPHA_THRESHOLD = 40;
/** Warm ivory from the design tokens, used where an opaque background is required. */
const IVORY = { r: 251, g: 248, b: 245, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function findSourceLogo() {
  const files = (await readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith(".png"));
  if (files.length !== 1) {
    throw new Error(`Expected exactly one PNG in ${sourceDir}, found ${files.length}.`);
  }
  return path.join(sourceDir, files[0]);
}

/** Returns the opaque bounding box of the rows [top, bottom) and the row occupancy profile. */
function measure({ data, info }) {
  const { width, height, channels } = info;
  const isOpaque = (x, y) => data[(y * width + x) * channels + 3] > ALPHA_THRESHOLD;
  const rowHasInk = Array.from({ length: height }, (_, y) => {
    for (let x = 0; x < width; x += 1) if (isOpaque(x, y)) return true;
    return false;
  });

  const bounds = (top, bottom) => {
    let left = width;
    let right = -1;
    let first = -1;
    let last = -1;
    for (let y = top; y < bottom; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!isOpaque(x, y)) continue;
        if (x < left) left = x;
        if (x > right) right = x;
        if (first === -1) first = y;
        last = y;
      }
    }
    if (right === -1) throw new Error(`No artwork found between rows ${top} and ${bottom}.`);
    return { left, top: first, width: right - left + 1, height: last - first + 1 };
  };

  return { rowHasInk, bounds };
}

/** Splits the stacked lockup at the largest empty horizontal band inside the artwork. */
function splitLockup(rowHasInk, full) {
  let best = null;
  let gapStart = -1;
  for (let y = full.top; y < full.top + full.height; y += 1) {
    if (!rowHasInk[y] && gapStart === -1) gapStart = y;
    if (rowHasInk[y] && gapStart !== -1) {
      if (!best || y - gapStart > best.end - best.start) best = { start: gapStart, end: y };
      gapStart = -1;
    }
  }
  if (!best) throw new Error("Could not find the gap between the monogram and the wordmark.");
  return best;
}

/** Places an image on a square canvas with the given padding ratio (0–0.5). */
async function squareIcon(input, size, { padding, background }) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(input)
    .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Builds a .ico file containing PNG-encoded images (supported by all current browsers). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, buffer } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngs.map(({ buffer }) => buffer)]);
}

async function main() {
  const sourcePath = await findSourceLogo();
  const source = sharp(sourcePath).ensureAlpha();
  const raw = await source.clone().raw().toBuffer({ resolveWithObject: true });
  const { rowHasInk, bounds } = measure(raw);

  const full = bounds(0, raw.info.height);
  const gap = splitLockup(rowHasInk, full);
  const symbolBox = bounds(full.top, gap.start);
  const wordmarkBox = bounds(gap.end, full.top + full.height);

  const lockup = await source.clone().extract(full).png({ compressionLevel: 9 }).toBuffer();
  const symbol = await source.clone().extract(symbolBox).png({ compressionLevel: 9 }).toBuffer();
  const wordmark = await source
    .clone()
    .extract(wordmarkBox)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await mkdir(path.join(publicBrandDir, "icons"), { recursive: true });
  await writeFile(path.join(publicBrandDir, "noryx-lockup.png"), lockup);
  await writeFile(path.join(publicBrandDir, "noryx-symbol.png"), symbol);
  await writeFile(path.join(publicBrandDir, "noryx-wordmark.png"), wordmark);

  // Browser tab and PWA icons keep a transparent background so they sit on any browser chrome.
  await writeFile(
    path.join(appDir, "icon.png"),
    await squareIcon(symbol, 256, { padding: 0.04, background: TRANSPARENT }),
  );
  await writeFile(
    path.join(appDir, "favicon.ico"),
    buildIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({
          size,
          buffer: await squareIcon(symbol, size, { padding: 0.02, background: TRANSPARENT }),
        })),
      ),
    ),
  );
  // iOS fills transparency with black, so the home-screen icon gets an ivory background.
  await writeFile(
    path.join(appDir, "apple-icon.png"),
    await squareIcon(symbol, 180, { padding: 0.16, background: IVORY }),
  );
  for (const size of [192, 512]) {
    await writeFile(
      path.join(publicBrandDir, "icons", `icon-${size}.png`),
      await squareIcon(symbol, size, { padding: 0.06, background: TRANSPARENT }),
    );
  }
  // Maskable icons need their artwork inside the central 80% safe zone.
  await writeFile(
    path.join(publicBrandDir, "icons", "icon-maskable-512.png"),
    await squareIcon(symbol, 512, { padding: 0.2, background: IVORY }),
  );

  // Social sharing image: the full lockup on warm ivory.
  const ogLockup = await sharp(lockup).resize({ height: 420, fit: "inside" }).png().toBuffer();
  await writeFile(
    path.join(appDir, "opengraph-image.png"),
    await sharp({ create: { width: 1200, height: 630, channels: 4, background: IVORY } })
      .composite([{ input: ogLockup, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  const summary = {
    source: path.relative(root, sourcePath),
    lockup: full,
    symbol: symbolBox,
    wordmark: wordmarkBox,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
