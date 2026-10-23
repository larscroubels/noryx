"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/feedback";
import { useT } from "@/i18n/client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT().common.error;
  useEffect(() => {
    console.error("Unhandled error", error.digest);
  }, [error]);

  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4">
      <ErrorState
        title={t.title}
        description={t.text}
        action={
          <div className="grid justify-items-center gap-3">
            <Button onClick={reset}>{t.retry}</Button>
            <Link href="/help#contact" className="text-sm font-semibold text-pink-700 hover:underline">
              {t.contact}
            </Link>
            {error.digest && <p className="text-xs text-fg-muted">{t.reference(error.digest)}</p>}
          </div>
        }
      />
    </main>
  );
}
