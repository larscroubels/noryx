import { describe, expect, it } from "vitest";

import { buildSetupChecklist } from "./setup-checklist";

describe("buildSetupChecklist", () => {
  it("all done when counts and booking are set", () => {
    const items = buildSetupChecklist({
      hours: 7,
      services: 3,
      workingHours: 5,
      bookingEnabled: true,
    });
    expect(items.map((i) => i.key)).toEqual(["hours", "services", "staff", "publish"]);
    expect(items.every((i) => i.done)).toBe(true);
  });

  it("publish needs booking enabled", () => {
    const items = buildSetupChecklist({
      hours: 1,
      services: 1,
      workingHours: 1,
      bookingEnabled: false,
    });
    expect(items.find((i) => i.key === "publish")).toMatchObject({
      done: false,
      href: "/app/settings#booking",
    });
    expect(
      buildSetupChecklist({ hours: 0, services: 0, workingHours: 0, bookingEnabled: false }).map(
        (i) => i.done,
      ),
    ).toEqual([false, false, false, false]);
  });
});
