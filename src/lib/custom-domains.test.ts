import { describe, expect, it } from "vitest";

import { customDomainPath, isPlatformHost } from "./custom-domains";

describe("custom domains", () => {
  it("recognises the platform's own hosts", () => {
    expect(isPlatformHost("noryx.be", "https://noryx.be")).toBe(true);
    expect(isPlatformHost("www.noryx.be:443", "https://noryx.be")).toBe(true);
    expect(isPlatformHost("localhost:3000", "https://noryx.be")).toBe(true);
    expect(isPlatformHost("noryx-git-main.vercel.app", "https://noryx.be")).toBe(true);
    expect(isPlatformHost("hairsalonsylvie.be", "https://noryx.be")).toBe(false);
  });

  it("maps a custom domain to the business's public routes only", () => {
    expect(customDomainPath("sylvie", "/")).toBe("/sylvie");
    expect(customDomainPath("sylvie", "/book")).toBe("/sylvie/book");
    expect(customDomainPath("sylvie", "/shop")).toBe("/sylvie/shop");
    expect(customDomainPath("sylvie", "/booking/abc")).toBe("/sylvie/booking/abc");
    expect(customDomainPath("sylvie", "/sylvie/book")).toBeNull();
    expect(customDomainPath("sylvie", "/app")).toBeNull();
    expect(customDomainPath("sylvie", "/bookings")).toBeNull();
    expect(customDomainPath("sylvie", "/_next/static/x.js")).toBeNull();
  });
});
