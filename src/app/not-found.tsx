import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export default async function NotFound() {
  const { notFound } = (await getT()).common;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-subtle px-4 text-center">
      <Logo variant="symbol" height={64} alt="" />
      <p className="mt-8 eyebrow">{notFound.eyebrow}</p>
      <h1 className="mt-3 font-display text-display-md font-semibold">{notFound.title}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{notFound.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">{notFound.home}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/app">{notFound.workspace}</Link>
        </Button>
      </div>
    </main>
  );
}
