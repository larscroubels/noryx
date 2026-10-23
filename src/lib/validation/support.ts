import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { rules } from "./common";

export const SUPPORT_TOPICS = ["question", "account", "billing", "problem", "other"] as const;

export const supportRequestSchema = (t: Dictionary) => {
  const r = rules(t);
  const c = t.site.support.contact;
  return z.object({
    name: r.requiredText(c.name, 120),
    email: r.email,
    topic: z.enum(SUPPORT_TOPICS, { error: t.validation.required(c.topic) }),
    message: r.requiredText(c.message, 4000, 10),
    // Honeypot: hidden from people, filled in by bots.
    company: z.string().max(0).optional(),
  });
};
