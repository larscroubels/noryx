import * as SecureStore from "expo-secure-store";

/**
 * Supabase session storage in the Keychain / Keystore. A session is larger than what
 * SecureStore accepts per value (about 2 KB), so values are split into chunks:
 * `key.count` holds the number of chunks, `key.0` … `key.n-1` the parts.
 * 600 characters stay under the limit even when every character takes 3 bytes.
 */
const CHUNK = 600;

async function chunkCount(key: string) {
  return Number((await SecureStore.getItemAsync(`${key}.count`)) ?? 0);
}

async function removeChunks(key: string, from: number, to: number) {
  for (let i = from; i < to; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await chunkCount(key);
    if (!count) return null;
    let value = "";
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null;
      value += part;
    }
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    const previous = await chunkCount(key);
    const parts = value.match(new RegExp(`[\\s\\S]{1,${CHUNK}}`, "g")) ?? [""];
    for (let i = 0; i < parts.length; i++) await SecureStore.setItemAsync(`${key}.${i}`, parts[i]!);
    await SecureStore.setItemAsync(`${key}.count`, String(parts.length));
    await removeChunks(key, parts.length, previous);
  },

  async removeItem(key: string): Promise<void> {
    await removeChunks(key, 0, await chunkCount(key));
    await SecureStore.deleteItemAsync(`${key}.count`);
  },
};
