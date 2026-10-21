import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { getT } from "@/i18n/server";
import { getSessionUser } from "@/lib/auth/session";

import { ResetPasswordForm } from "./reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.reset.metaTitle };
}

export default async function ResetPasswordPage() {
  const [user, t] = await Promise.all([getSessionUser(), getT()]);
  return (
    <div>
      <h1 className="font-display text-display-sm font-semibold">{t.auth.reset.title}</h1>
      {user ? (
        <>
          <p className="mt-2 text-fg-muted">{t.auth.reset.signedInAs(user.email ?? "")}</p>
          <ResetPasswordForm />
        </>
      ) : (
        <Alert tone="warning" className="mt-6" title={t.auth.reset.invalidTitle}>
          {t.auth.reset.invalidText} <Link href="/forgot-password">{t.auth.reset.requestNew}</Link>.
        </Alert>
      )}
    </div>
  );
}
