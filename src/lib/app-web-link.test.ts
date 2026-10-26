import { describe, expect, it } from "vitest";

import { workspacePath } from "./app-web-link";

describe("workspacePath", () => {
  it("only allows workspace paths", () => {
    expect(workspacePath("/app/finance")).toBe("/app/finance");
    expect(workspacePath("/app")).toBe("/app");
    expect(workspacePath("/app/settings#hours")).toBe("/app/settings#hours");
    expect(workspacePath("/apps")).toBeNull();
    expect(workspacePath("//evil.com")).toBeNull();
    expect(workspacePath("https://evil.com")).toBeNull();
    expect(workspacePath("/login")).toBeNull();
    expect(workspacePath("/app\..")).toBeNull();
    expect(workspacePath("/app/../login")).toBeNull();
    expect(workspacePath(123)).toBeNull();
    expect(workspacePath(undefined)).toBeNull();
  });
});
