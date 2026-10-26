import { dictionaries } from "@/i18n/dictionaries";

import { clockErrorMessage } from "./clock";

const t = dictionaries.en;
const c = t.timeClock;

it("maps every clock error like the website", () => {
  expect(clockErrorMessage({ message: "already_clocked_in" }, t)).toBe(c.errors.alreadyIn);
  expect(clockErrorMessage({ message: "not_clocked_in" }, t)).toBe(c.errors.notIn);
  expect(clockErrorMessage({ code: "42501", message: "x" }, t)).toBe(c.errors.noProfile);
  expect(clockErrorMessage({ message: "plan_feature_time_clock" }, t)).toBe(
    t.errors.planFeatureTimeClock,
  );
  expect(clockErrorMessage({ code: "XX000", message: "boom" }, t)).toBe(t.errors.generic);
});
