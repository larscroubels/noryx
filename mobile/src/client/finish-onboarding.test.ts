import { finishOnboarding } from "./finish-onboarding";

it("waits for the new links before leaving onboarding", async () => {
  const order: string[] = [];
  let resolve: () => void = () => {};
  const refetch = () =>
    new Promise<void>((r) => {
      resolve = () => {
        order.push("links loaded");
        r();
      };
    });
  const done = finishOnboarding(refetch, () => order.push("navigate"));
  expect(order).toEqual([]);
  resolve();
  await done;
  expect(order).toEqual(["links loaded", "navigate"]);
});
