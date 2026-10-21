import type { Metadata } from "next";

import { CourseView } from "@/components/help/course-view";
import { getCourse } from "@/content/help";
import { getI18n } from "@/i18n/server";

export async function generateMetadata({ params }: PageProps<"/help/[slug]">): Promise<Metadata> {
  const [{ slug }, { t, locale }] = await Promise.all([params, getI18n()]);
  const course = getCourse(locale, slug);
  return course
    ? { title: `${course.title} · ${t.help.title}`, description: course.summary }
    : { title: t.help.title };
}

export default async function HelpCoursePage({ params }: PageProps<"/help/[slug]">) {
  const { slug } = await params;
  return (
    <div className="container-page py-10 sm:py-14">
      <CourseView basePath="/help" slug={slug} />
    </div>
  );
}
