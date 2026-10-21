/**
 * Image upload helpers. The file type is detected from the file's bytes
 * (magic numbers), never trusted from its name or the browser's MIME type.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const BUSINESS_ASSETS_BUCKET = "business-assets";

export type ImageType = {
  mime: "image/png" | "image/jpeg" | "image/webp";
  extension: "png" | "jpg" | "webp";
};

export function detectImageType(bytes: Uint8Array): ImageType | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((value, index) => bytes[offset + index] === value);
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return { mime: "image/png", extension: "png" };
  if (startsWith([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", extension: "jpg" };
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8))
    return { mime: "image/webp", extension: "webp" };
  return null;
}

/** Public URL of a stored business asset. */
export function publicAssetUrl(supabaseUrl: string, path: string | null | undefined) {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/${BUSINESS_ASSETS_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
