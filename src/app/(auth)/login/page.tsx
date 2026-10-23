import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { getT } from "@/i18n/server";

import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.login.metaTitle };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const next = typeof params.next === "string" ? params.next : "/app";
  return (
    <div>
      <h1 className="font-display text-display-sm font-semibold">{t.auth.login.title}</h1>
      <p className="mt-2 text-fg-muted">{t.auth.login.lead}</p>
      {params.error === "link_expired" && (
        <Alert tone="warning" className="mt-6">
          {t.auth.login.linkExpired}
        </Alert>
      )}
      {params.error === "confirmed_sign_in" && (
        <Alert tone="success" className="mt-6">
          {t.auth.login.confirmedSignIn}
        </Alert>
      )}
      <LoginForm next={next} />
      <p className="mt-8 text-center text-sm text-fg-muted">
        {t.auth.login.newHere}{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-pink-700 hover:underline"
        >
          {t.auth.login.createAccount}
        </Link>
      </p>
    </div>
  );
}
