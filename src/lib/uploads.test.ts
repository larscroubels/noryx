import { describe, expect, it } from "vitest";

import { detectImageType, publicAssetUrl } from "./uploads";

describe("detectImageType", () => {
  it("recognises PNG, JPEG and WebP by their signatures", () => {
    expect(
      detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))?.mime,
    ).toBe("image/png");
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
    expect(
      detectImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]))
        ?.mime,
    ).toBe("image/webp");
  });

  it("rejects anything else, including disguised files", () => {
    expect(detectImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
    expect(detectImageType(new Uint8Array([]))).toBeNull();
  });
});

describe("publicAssetUrl", () => {
  it("builds an encoded public storage URL", () => {
    expect(publicAssetUrl("https://x.supabase.co", "abc/logo 1.png")).toBe(
      "https://x.supabase.co/storage/v1/object/public/business-assets/abc/logo%201.png",
    );
    expect(publicAssetUrl("https://x.supabase.co", null)).toBeNull();
  });
});
