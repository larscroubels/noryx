import { ArrowRight, BookOpen, LayoutDashboard, Mail, MessageCircle, MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { HelpHome } from "@/components/help/help-home";
import { OpenAssistantButton } from "@/components/marketing/assistant/open-assistant-button";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { getSessionUser } from "@/lib/auth/session";

import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.help.title, description: t.help.lead };
}

export default async function HelpPage() {
  const [t, user] = await Promise.all([getT(), getSessionUser()]);
  const s = t.site.support;
  return (
    <>
      <div className="container-page py-14 sm:py-20">
        <HelpHome basePath="/help" showFaq={false} />
      </div>

      <section aria-labelledby="support-title" className="border-t border-border bg-surface-subtle py-16 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 id="support-title" className="font-display text-display-md font-semibold">
              {s.title}
            </h2>
            <p className="mt-4 text-lg text-fg-muted">{s.lead}</p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SupportCard icon={<BookOpen />} title={s.courses.title} text={s.courses.text}>
              <Button asChild variant="secondary">
                <a href="#courses">
                  {t.help.courses} <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </SupportCard>
            <SupportCard icon={<MessageCircleQuestion />} title={s.faq.title} text={s.faq.text}>
              <Button asChild variant="secondary">
                <Link href="/faq">
                  {t.marketing.nav.faq} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </SupportCard>
            <SupportCard icon={<MessageCircle />} title={s.assistant.title} text={s.assistant.text}>
              <OpenAssistantButton label={s.assistant.action} />
            </SupportCard>
            <SupportCard icon={<LayoutDashboard />} title={s.workspace.title} text={s.workspace.text}>
              <Button asChild variant="secondary">
                <Link href={user ? "/app/help" : "/login?next=%2Fapp%2Fhelp"}>
                  {s.workspace.action} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </SupportCard>
          </ul>

          <div
            id="contact"
            className="mt-12 grid scroll-mt-24 gap-8 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border sm:p-8 lg:grid-cols-[1fr_1.6fr] lg:gap-12"
          >
            <div>
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-lg bg-pink-50 text-pink-700 ring-1 ring-pink-100"
              >
                <Mail className="size-5" />
              </span>
              <h2 className="mt-5 font-display text-display-sm font-semibold">{s.contact.title}</h2>
              <p className="mt-3 text-fg-muted">{s.contact.lead}</p>
            </div>
            <ContactForm defaultName={user?.fullName ?? undefined} defaultEmail={user?.email ?? undefined} />
          </div>
        </div>
      </section>
    </>
  );
}

/** Four shared rows (subgrid): icon, title, text and action line up across the row. */
function SupportCard({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <li className="row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl bg-surface p-6 shadow-sm ring-1 ring-neutral-200/70">
      <span aria-hidden="true" className="text-rosegold-700 [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-fg-muted">{text}</p>
      <div className="mt-5 self-end">{children}</div>
    </li>
  );
}
