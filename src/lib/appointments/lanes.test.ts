import { describe, expect, it } from "vitest";

import { assignLanes } from "./lanes";

describe("assignLanes", () => {
  it("keeps non-overlapping events full width", () => {
    const lanes = assignLanes([
      { id: "a", start: 0, end: 10 },
      { id: "b", start: 10, end: 20 },
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 1 });
    expect(lanes.get("b")).toEqual({ lane: 0, lanes: 1 });
  });

  it("places overlapping events side by side and reuses freed lanes", () => {
    const lanes = assignLanes([
      { id: "a", start: 0, end: 30 },
      { id: "b", start: 10, end: 20 },
      { id: "c", start: 20, end: 40 },
      { id: "d", start: 50, end: 60 },
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get("b")).toEqual({ lane: 1, lanes: 2 });
    expect(lanes.get("c")).toEqual({ lane: 1, lanes: 2 });
    expect(lanes.get("d")).toEqual({ lane: 0, lanes: 1 });
  });
});
