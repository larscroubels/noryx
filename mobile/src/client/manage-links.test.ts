import { replaceSalon } from "./manage-links";

const mockLink = jest.fn();
const mockUnlink = jest.fn();
jest.mock("./api", () => ({
  ...jest.requireActual("./api"),
  linkSalon: (...args: unknown[]) => mockLink(...args),
  unlinkSalon: (...args: unknown[]) => mockUnlink(...args),
}));

beforeEach(() => {
  mockLink.mockReset();
  mockUnlink.mockReset();
});

it("keeps the old salon when the new code fails", async () => {
  mockLink.mockResolvedValue({ ok: false, error: "connection_code_invalid" });
  const result = await replaceSalon("old", "WRONG-0000", ["hair"], []);
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
  const result = await replaceSalon("old", "NEWS-ABCDEF", ["hair"], []);
  expect(result).toMatchObject({ ok: true, businessId: "new" });
  expect(order).toEqual(["link", "unlink"]);
  expect(mockUnlink).toHaveBeenCalledWith("old");
});

it("doesn't unlink when the new code is the same salon", async () => {
  mockLink.mockResolvedValue({ ok: true, businessId: "old", name: "Same", slug: "same" });
  await replaceSalon("old", "SAME-ABCDEF", ["hair"], []);
  expect(mockUnlink).not.toHaveBeenCalled();
});
