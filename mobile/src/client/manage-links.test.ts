import type { ClientLink } from "./api";
import { linkCodes, replaceSalon } from "./manage-links";

const mockLink = jest.fn();
const mockUnlink = jest.fn();
jest.mock("./api", () => ({
  ...jest.requireActual("./api"),
  linkSalon: (...args: unknown[]) => mockLink(...args),
  unlinkSalon: (...args: unknown[]) => mockUnlink(...args),
}));

const old: ClientLink = {
  business_id: "old",
  slug: "old",
  name: "Old",
  logo_path: null,
  categories: ["hair", "nails"],
  linked_at: "2026-10-01T00:00:00Z",
  unlinked_at: null,
};

beforeEach(() => {
  mockLink.mockReset();
  mockUnlink.mockReset();
});

it("keeps the old salon when the new code fails", async () => {
  mockLink.mockResolvedValue({ ok: false, error: "connection_code_invalid" });
  const result = await replaceSalon(old, "WRONG-0000", [old]);
  expect(result).toEqual({ ok: false, error: "connection_code_invalid" });
  expect(mockUnlink).not.toHaveBeenCalled();
});

it("unlinks the old salon after the new one is linked", async () => {
  const order: string[] = [];
  mockLink.mockImplementation(async () => {
    order.push("link");
    return { ok: true, businessId: "new", name: "New", slug: "new" };
  });
  mockUnlink.mockImplementation(async () => {
    order.push("unlink");
  });
  const result = await replaceSalon(old, "NEWS-ABCDEF", [old]);
  expect(result).toMatchObject({ ok: true, businessId: "new" });
  expect(order).toEqual(["link", "unlink"]);
  expect(mockUnlink).toHaveBeenCalledWith("old");
});

it("doesn't unlink when the new code is the same salon", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "old", name: "Same", slug: "same" });
  await replaceSalon(old, "SAME-ABCDEF", [old]);
  expect(mockUnlink).not.toHaveBeenCalled();
});

it("the new salon takes over every service of the old one", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "new", name: "New", slug: "new" });
  await replaceSalon(old, "NEWS-ABCDEF", [old]);
  expect(mockLink).toHaveBeenCalledWith("NEWS-ABCDEF", ["hair", "nails"]);
});

it("says so when the old salon couldn't be unlinked", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "new", name: "New", slug: "new" });
  mockUnlink.mockRejectedValue(new Error("Network request failed"));
  const result = await replaceSalon(old, "NEWS-ABCDEF", [old]);
  expect(result).toEqual({ ok: false, error: "unlink_failed" });
});

it("keeps earlier results when a later code fails", async () => {
  mockLink
    .mockResolvedValueOnce({ ok: true, businessId: "a", name: "A", slug: "a" })
    .mockRejectedValueOnce(new Error("Network request failed"));
  const outcomes = await linkCodes(
    [
      { category: "hair", code: "AAAA-111111" },
      { category: "nails", code: "BBBB-222222" },
    ],
    [],
  );
  expect(outcomes.get("AAAA-111111")).toMatchObject({ ok: true, name: "A" });
  expect(outcomes.get("BBBB-222222")).toEqual({ ok: false, error: "failed" });
});
