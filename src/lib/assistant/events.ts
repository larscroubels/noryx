/**
 * The website assistant answers as newline-delimited JSON, so the browser can
 * render text while it streams and still tell text, sources and errors apart.
 */

/** A page of the website that answers (part of) the question. */
export type AssistantSource = { title: string; text: string; href: string };

export type AssistantEvent =
  | { type: "text"; text: string }
  /** Discard the text so far: the model handed over to a fallback model, or declined. */
  | { type: "reset" }
  | { type: "sources"; intro: string; items: AssistantSource[] }
  | { type: "error"; message: string };

export function encodeEvent(event: AssistantEvent) {
  return `${JSON.stringify(event)}\n`;
}

/**
 * Splits streamed chunks into events. Feed it every decoded chunk; a line cut
 * off at a chunk boundary is kept until the rest arrives.
 */
export function createEventParser() {
  let buffer = "";
  return (chunk: string): AssistantEvent[] => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    return lines.filter((line) => line.trim()).map((line) => JSON.parse(line) as AssistantEvent);
  };
}
