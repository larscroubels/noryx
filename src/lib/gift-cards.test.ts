import { describe, expect, it } from "vitest";

import { GIFT_CARD_CODE_PATTERN, normaliseGiftCardCode } from "./gift-cards";

describe("gift card codes", () => {
  it("accepts codes with dashes, spaces or nothing in between, in any case", () => {
    for (const input of ["ABCD-EFGH-JKMN-PQRS", "abcd efgh jkmn pqrs", "ABCDEFGHJKMNPQRS"])
      expect(GIFT_CARD_CODE_PATTERN.test(input)).toBe(true);
    expect(normaliseGiftCardCode(" abcd efgh-jkmn pqrs ".trim())).toBe("ABCDEFGHJKMNPQRS");
  });

  it("rejects anything that can't be a code", () => {
    for (const input of ["ABCD-EFGH-JKMN", "ABCD-EFGH-JKMN-PQRS-TVWX", "ABCD_EFGH_JKMN_PQRS", ""])
      expect(GIFT_CARD_CODE_PATTERN.test(input)).toBe(false);
  });
});
