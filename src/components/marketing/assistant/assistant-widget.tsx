"use client";

import { ArrowRight, ArrowUp, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/i18n/client";
import { createEventParser, type AssistantSource } from "@/lib/assistant/events";
import { cn } from "@/lib/cn";

import { OPEN_ASSISTANT_EVENT } from "./open-assistant-button";
import { RichText } from "./rich-text";

type Item = {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: AssistantSource[];
  error?: boolean;
  pending?: boolean;
};

/** Messages sent along as context; older ones are dropped to keep requests small. */
const HISTORY = 12;

/** Chat window in the bottom-right corner of the public website. */
export function AssistantWidget() {
  const a = useT().assistant;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const nextId = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    if (open) field.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [items]);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_ASSISTANT_EVENT, show);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, show);
  }, []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;
    const history = [...items.filter((item) => item.text && !item.error && !item.sources), { role: "user", text }]
      .map((item) => ({ role: item.role, content: item.text }))
      .slice(-HISTORY);
    while (history[0]?.role === "assistant") history.shift();

    const replyId = (nextId.current += 2);
    setItems((current) => [
      ...current,
      { id: replyId - 1, role: "user", text },
      { id: replyId, role: "assistant", text: "", pending: true },
    ]);
    setInput("");
    setPending(true);
    const update = (change: (item: Item) => Item) =>
      setItems((current) => current.map((item) => (item.id === replyId ? change(item) : item)));

    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parse = createEventParser();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const event of parse(decoder.decode(value, { stream: true }))) {
          if (event.type === "text") update((item) => ({ ...item, text: item.text + event.text }));
          else if (event.type === "reset") update((item) => ({ ...item, text: "" }));
          else if (event.type === "sources")
            update((item) => ({ ...item, text: event.intro, sources: event.items }));
          else update((item) => ({ ...item, text: event.message, error: true }));
        }
      }
      update((item) => (item.text ? item : { ...item, text: a.error, error: true }));
    } catch {
      if (!controller.signal.aborted) update((item) => ({ ...item, text: a.error, error: true }));
    } finally {
      update((item) => ({ ...item, pending: false }));
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  if (!open) {
    return (
      <Button
        ref={launcher}
        size="lg"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-50 rounded-full shadow-lg print:hidden sm:right-6 sm:bottom-6"
      >
        <MessageCircle aria-hidden="true" className="size-5!" />
        {a.open}
      </Button>
    );
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
      className="fixed inset-x-3 bottom-3 z-50 flex h-[min(38rem,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-border motion-safe:animate-card-in print:hidden sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[25rem]"
    >
      <header className="flex items-start gap-3 border-b border-border bg-surface-subtle px-5 py-4">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-700 ring-1 ring-pink-100"
        >
          <MessageCircle className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-semibold">
            {a.title}
          </h2>
          <p className="text-sm text-fg-muted">{a.subtitle}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label={a.close}>
          <X aria-hidden="true" />
        </Button>
      </header>

      <div
        ref={log}
        role="log"
        aria-busy={pending}
        aria-label={a.title}
        className="grid flex-1 content-start gap-3 overflow-y-auto px-5 py-4 text-sm"
      >
        <Bubble role="assistant" label={a.bot}>
          <p>{a.greeting}</p>
        </Bubble>
        {items.length === 0 && (
          <ul className="flex flex-wrap gap-2">
            {a.suggestions.map((suggestion) => (
              <li key={suggestion}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void ask(suggestion)}
                  className="h-auto py-1.5 text-left whitespace-normal"
                >
                  {suggestion}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {items.map((item) => (
          <Bubble key={item.id} role={item.role} label={item.role === "user" ? a.you : a.bot} error={item.error}>
            {item.pending && !item.text ? (
              <p className="flex items-center gap-2 text-fg-muted">
                <Spinner /> {a.thinking}
              </p>
            ) : item.role === "user" ? (
              <p className="whitespace-pre-wrap">{item.text}</p>
            ) : (
              <>
                <RichText text={item.text} />
                {item.sources && (
                  <ul className="mt-3 grid gap-2">
                    {item.sources.map((source) => (
                      <li key={`${source.href}-${source.title}`} className="rounded-lg bg-surface p-3 ring-1 ring-border">
                        <p className="font-semibold">{source.title}</p>
                        <p className="mt-1 line-clamp-3 text-fg-muted">{source.text}</p>
                        <Link
                          href={source.href}
                          className="mt-1.5 inline-flex items-center gap-1 font-semibold text-pink-700 hover:underline"
                        >
                          {a.readMore} <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Bubble>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-border px-4 pt-3 pb-2">
        <label htmlFor={inputId} className="sr-only">
          {a.inputLabel}
        </label>
        <div className="flex gap-2">
          <Input
            ref={field}
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={a.placeholder}
            maxLength={2000}
            autoComplete="off"
            className="min-w-0 flex-1"
          />
          <Button type="submit" size="icon" aria-label={a.send} disabled={pending || !input.trim()}>
            <ArrowUp aria-hidden="true" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-fg-muted">{a.disclaimer}</p>
      </form>
    </section>
  );
}

function Bubble({
  role,
  label,
  error,
  children,
}: {
  role: Item["role"];
  label: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[90%] rounded-2xl px-3.5 py-2.5",
        role === "user"
          ? "justify-self-end rounded-br-md bg-primary text-primary-fg"
          : "justify-self-start rounded-bl-md bg-surface-subtle ring-1 ring-border",
        error && "ring-danger-600/40",
      )}
    >
      <span className="sr-only">{label}: </span>
      {children}
    </div>
  );
}
