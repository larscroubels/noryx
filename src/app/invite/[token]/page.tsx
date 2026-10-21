import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import type { MemberRole } from "@/lib/auth/permissions";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { AcceptForm } from "./accept-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).team.invitePage.metaTitle, robots: { index: false } };
}

type Invitation = {
  business_name: string;
  email: string;
  role: MemberRole;
  expired: boolean;
  used: boolean;
};

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_invitation", { p_token: token });
  const invitation = data as Invitation | null;
  const [user, t] = await Promise.all([getSessionUser(), getT()]);
  const p = t.team.invitePage;
  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-subtle px-4 py-12">
      <div className="mb-8 flex w-full max-w-md items-center justify-between gap-4">
        <Link href="/">
          <Logo variant="wordmark" height={22} priority />
        </Link>
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="grid gap-5 p-6 sm:p-8">
          {!invitation ? (
            <Alert tone="warning" title={p.notFound}>
              {p.notFoundText}
            </Alert>
          ) : invitation.used || invitation.expired ? (
            <Alert
              tone="warning"
              title={invitation.used ? p.used : p.expired}
            >
              {p.askNew(invitation.business_name)}
            </Alert>
          ) : (
            <>
              <div>
                <p className="eyebrow">{p.eyebrow}</p>
                <h1 className="mt-2 font-display text-display-sm font-semibold">
                  {p.join(invitation.business_name)}
                </h1>
                <p className="mt-2 text-fg-muted">
                  {p.invitedAs}{" "}
                  <strong className="text-fg">
                    {t.common.roles[invitation.role].toLowerCase()}
                  </strong>{" "}
                  {p.using} <strong className="text-fg">{invitation.email}</strong>.
                </p>
              </div>
              {user ? (
                user.email?.toLowerCase() === invitation.email ? (
                  <AcceptForm token={token} />
                ) : (
                  <Alert tone="warning">
                    {p.wrongUser(user.email ?? "", invitation.email)}
                  </Alert>
                )
              ) : (
                <div className="grid gap-3">
                  <Button asChild size="lg">
                    <Link href={`/signup?next=${next}`}>{p.create}</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href={`/login?next=${next}`}>{p.haveAccount}</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
