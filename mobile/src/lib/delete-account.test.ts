import { requestAccountDeletion } from "./delete-account";

const respond = (status: number, body: unknown) =>
  jest.fn(async () => ({ ok: status < 300, status, json: async () => body })) as never;

it("maps 200 to deleted", async () => {
  expect(await requestAccountDeletion("tok", respond(200, { ok: true }))).toBe("deleted");
});

it("maps account_owns_business to owns_business", async () => {
  const fetchImpl = respond(400, { ok: false, error: "account_owns_business" });
  expect(await requestAccountDeletion("tok", fetchImpl)).toBe("owns_business");
});

it("maps 401, 500 and network errors to failed", async () => {
  expect(await requestAccountDeletion("tok", respond(401, { ok: false }))).toBe("failed");
  expect(await requestAccountDeletion("tok", respond(500, { ok: false }))).toBe("failed");
  const offline = jest.fn(async () => {
    throw new TypeError("Network request failed");
  }) as never;
  expect(await requestAccountDeletion("tok", offline)).toBe("failed");
});

it("sends the bearer token", async () => {
  const fetchImpl = respond(200, { ok: true }) as unknown as jest.Mock;
  await requestAccountDeletion("tok", fetchImpl as never);
  const [url, init] = fetchImpl.mock.calls[0];
  expect(String(url)).toMatch(/\/api\/account\/delete$/);
  expect(init).toMatchObject({ method: "POST", headers: { Authorization: "Bearer tok" } });
});
