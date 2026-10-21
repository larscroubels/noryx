import type { Metadata } from "next";
import Link from "next/link";

import { getT } from "@/i18n/server";

import { SignUpForm } from "./signup-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.signup.metaTitle };
}

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const next = typeof params.next === "string" ? params.next : "/onboarding";
  return (
    <div>
      <h1 className="font-display text-display-sm font-semibold">{t.auth.signup.title}</h1>
      <p className="mt-2 text-fg-muted">{t.auth.signup.lead}</p>
      <SignUpForm next={next} />
      <p className="mt-8 text-center text-sm text-fg-muted">
        {t.auth.signup.haveAccount}{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-pink-700 hover:underline">
          {t.auth.signup.signIn}
        </Link>
      </p>
    </div>
  );
}
