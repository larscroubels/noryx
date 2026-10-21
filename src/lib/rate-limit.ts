/**
 * Fixed-window rate limiter kept in process memory. Good enough for a single
 * server; replace with a shared store (e.g. Redis) before running several instances.
 */
const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now = Date.now(),
) {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 10_000) {
      for (const [entryKey, entry] of windows) if (entry.resetAt <= now) windows.delete(entryKey);
    }
    return { allowed: true, remaining: limit - 1 };
  }
  if (current.count >= limit)
    return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };
  current.count += 1;
  return { allowed: true, remaining: limit - current.count };
}
