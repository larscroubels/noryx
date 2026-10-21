import { describe, expect, it } from "vitest";

import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes separators and neutralises spreadsheet formulas", () => {
    expect(
      toCsv(
        ["name", "note"],
        [
          ["Anne, B.", '=HYPERLINK("x")'],
          ["Line\nbreak", null],
        ],
      ),
    ).toBe('name,note\r\n"Anne, B.","\'=HYPERLINK(""x"")"\r\n"Line\nbreak",\r\n');
  });
});
