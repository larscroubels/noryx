import { secureStorage } from "./secure-storage";

const mockStore = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    if (value.length > 2048) throw new Error("too large");
    mockStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockStore.delete(key);
  }),
}));

beforeEach(() => mockStore.clear());

it("round-trips a 5 KB value in chunks", async () => {
  const value = "x".repeat(5000) + "é✓";
  await secureStorage.setItem("sb-session", value);
  expect([...mockStore.keys()].length).toBeGreaterThan(2);
  expect(await secureStorage.getItem("sb-session")).toBe(value);
});

it("removeItem deletes every chunk", async () => {
  await secureStorage.setItem("sb-session", "y".repeat(5000));
  await secureStorage.removeItem("sb-session");
  expect(mockStore.size).toBe(0);
  expect(await secureStorage.getItem("sb-session")).toBeNull();
});

it("a shorter value replaces a longer one completely", async () => {
  await secureStorage.setItem("sb-session", "z".repeat(5000));
  await secureStorage.setItem("sb-session", "short");
  expect(await secureStorage.getItem("sb-session")).toBe("short");
  expect(mockStore.size).toBe(2);
});
