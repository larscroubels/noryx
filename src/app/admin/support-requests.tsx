import { Inbox, Mail, Trash2 } from "lucide-react";

import { ConfirmAction } from "@/components/forms/confirm-action";
import { SubmitButton } from "@/components/forms/form-controls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDateTime } from "@/lib/format";
import type { Tables } from "@/types/database";

import { deleteSupportRequest, setSupportRequestStatus } from "./actions";

type Request = Pick<
  Tables<"support_requests">,
  "id" | "name" | "email" | "topic" | "message" | "locale" | "user_id" | "status" | "created_at"
>;

/** Inbox for questions sent through the contact form on /help. */
export function SupportRequests({ requests, t, intl }: { requests: Request[]; t: Dictionary; intl: string }) {
  const s = t.admin.support;
  const open = requests.filter((request) => request.status === "open");
  const closed = requests.filter((request) => request.status === "closed");
  const item = (request: Request) => (
    <li key={request.id} className="grid gap-3 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-semibold">{request.name}</span>
        <a href={`mailto:${request.email}`} className="text-pink-700 hover:underline">
          {request.email}
        </a>
        <Badge tone="neutral">{t.site.support.contact.topics[request.topic]}</Badge>
        <span className="text-fg-muted uppercase">{request.locale}</span>
        {request.user_id && <Badge tone="outline">{s.signedIn}</Badge>}
        <span className="ml-auto text-fg-muted">{formatDateTime(request.created_at, undefined, intl)}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{request.message}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${request.email}?subject=${encodeURIComponent(`NORYX: ${t.site.support.contact.topics[request.topic]}`)}`}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border-strong px-3 text-sm font-semibold hover:bg-surface-subtle"
        >
          <Mail className="size-4" aria-hidden="true" /> {s.reply}
        </a>
        <form action={setSupportRequestStatus}>
          <input type="hidden" name="requestId" value={request.id} />
          <input type="hidden" name="status" value={request.status === "open" ? "closed" : "open"} />
          <SubmitButton size="sm" variant="secondary">
            {request.status === "open" ? s.markClosed : s.reopen}
          </SubmitButton>
        </form>
        <ConfirmAction
          trigger={
            <>
              <Trash2 aria-hidden="true" /> {s.delete}
            </>
          }
          triggerVariant="ghost"
          triggerSize="sm"
          title={s.deleteTitle}
          description={s.deleteText}
          confirmLabel={s.delete}
          action={deleteSupportRequest}
          hiddenFields={{ requestId: request.id }}
        />
      </div>
    </li>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="size-4 text-fg-muted" aria-hidden="true" /> {s.title}
          {open.length > 0 && <Badge tone="brand">{`${open.length} ${s.open.toLowerCase()}`}</Badge>}
        </CardTitle>
        <p className="text-sm text-fg-muted">{s.lead}</p>
      </CardHeader>
      <CardContent>
        {open.length === 0 ? (
          <p className="text-sm text-fg-muted">{s.empty}</p>
        ) : (
          <ul className="divide-y divide-border">{open.map(item)}</ul>
        )}
        {closed.length > 0 && (
          <details className="mt-4 border-t border-border pt-4">
            <summary className="cursor-pointer text-sm font-semibold">{s.showClosed(closed.length)}</summary>
            <ul className="mt-2 divide-y divide-border">{closed.map(item)}</ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
