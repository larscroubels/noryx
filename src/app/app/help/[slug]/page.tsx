import type { Metadata } from "next";

import { CourseView } from "@/components/help/course-view";
import { getCourse } from "@/content/help";
import { getI18n } from "@/i18n/server";

export async function generateMetadata({ params }: PageProps<"/app/help/[slug]">): Promise<Metadata> {
  const [{ slug }, { t, locale }] = await Promise.all([params, getI18n()]);
  return { title: getCourse(locale, slug)?.title ?? t.help.title };
}

export default async function WorkspaceHelpCoursePage({ params }: PageProps<"/app/help/[slug]">) {
  const { slug } = await params;
  return <CourseView basePath="/app/help" slug={slug} />;
}
