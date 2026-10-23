"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Event the assistant widget listens for, so other parts of the page can open it. */
export const OPEN_ASSISTANT_EVENT = "noryx:open-assistant";

export function OpenAssistantButton({ label }: { label: string }) {
  return (
    <Button variant="secondary" onClick={() => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT))}>
      <MessageCircle aria-hidden="true" /> {label}
    </Button>
  );
}
