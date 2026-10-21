import type { Metadata } from "next";

import { HelpHome } from "@/components/help/help-home";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).help.title };
}

export default function WorkspaceHelpPage() {
  return <HelpHome basePath="/app/help" compact />;
}
