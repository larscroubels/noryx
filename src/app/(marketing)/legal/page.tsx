import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { legalContent } from "@/content/legal";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const doc = legalContent(await getLocale()).notice;
  return { title: doc.metaTitle, description: doc.lead };
}

export default function LegalNoticePage() {
  return <LegalDocument kind="notice" />;
}
