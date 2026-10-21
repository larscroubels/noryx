/**
 * Minimal structured logger. Personal data (emails, phone numbers, names, tokens)
 * is redacted by key so logs stay useful without collecting customer information.
 */
const SENSITIVE_KEYS = /email|phone|name|password|token|secret|key|note|address/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.test(key) ? "[redacted]" : redact(item, depth + 1),
    ]),
  );
}

type Level = "info" | "warn" | "error";

function write(level: Level, event: string, context?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...(redact(context ?? {}) as object),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => write("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) => write("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) => write("error", event, context),
};

export { redact };
