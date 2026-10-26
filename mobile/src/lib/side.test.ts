import { chooseSide } from "./side";

it("salon only", () => {
  expect(chooseSide({ memberships: 1, links: 0, lastSide: null })).toBe("salon");
});

it("client only", () => {
  expect(chooseSide({ memberships: 0, links: 2, lastSide: "salon" })).toBe("client");
});

it("neither → client", () => {
  expect(chooseSide({ memberships: 0, links: 0, lastSide: null })).toBe("client");
});

it("both uses last side", () => {
  expect(chooseSide({ memberships: 1, links: 1, lastSide: "client" })).toBe("client");
  expect(chooseSide({ memberships: 1, links: 1, lastSide: "salon" })).toBe("salon");
});

it("both without last side → pick", () => {
  expect(chooseSide({ memberships: 2, links: 1, lastSide: null })).toBe("pick");
});
