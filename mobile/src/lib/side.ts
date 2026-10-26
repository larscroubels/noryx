import * as SecureStore from "expo-secure-store";

export type Side = "salon" | "client";

const SIDE_KEY = "noryx.side";

/**
 * Which side opens after sign-in (spec 5.2): team members only → salon; client links
 * only, or neither (a new account) → client; both → the side used last, else ask.
 */
export function chooseSide(input: {
  memberships: number;
  links: number;
  lastSide: Side | null;
}): Side | "pick" {
  if (input.memberships === 0) return "client";
  if (input.links === 0) return "salon";
  return input.lastSide ?? "pick";
}

export async function getLastSide(): Promise<Side | null> {
  const stored = await SecureStore.getItemAsync(SIDE_KEY);
  return stored === "salon" || stored === "client" ? stored : null;
}

export function rememberSide(side: Side) {
  return SecureStore.setItemAsync(SIDE_KEY, side);
}
