import { z } from "zod";

export type FieldErrors = Record<string, string | undefined>;

/** First message per field from a failed Zod parse, as the website's forms show them. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(Object.entries(flat).map(([key, messages]) => [key, messages?.[0]]));
}
