import type { Metadata } from "next";

import { HelpHome } from "@/components/help/help-home";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.help.title, description: t.help.lead };
}

export default function HelpPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <HelpHome basePath="/help" />
    </div>
  );
}
