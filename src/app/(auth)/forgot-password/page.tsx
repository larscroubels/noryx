import type { Metadata } from "next";
import Link from "next/link";

import { getT } from "@/i18n/server";

import { ForgotPasswordForm } from "./forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).auth.forgot.metaTitle };
}

export default async function ForgotPasswordPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="font-display text-display-sm font-semibold">{t.auth.forgot.title}</h1>
      <p className="mt-2 text-fg-muted">{t.auth.forgot.lead}</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-fg-muted">
        {t.auth.forgot.remembered}{" "}
        <Link href="/login" className="font-semibold text-pink-700 hover:underline">
          {t.auth.forgot.backToSignIn}
        </Link>
      </p>
    </div>
  );
}
