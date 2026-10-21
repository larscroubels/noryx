import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { requireWorkspace } from "@/lib/auth/session";

import { EmailForm, PasswordForm, ProfileForm } from "./forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).account.metaTitle };
}

export default async function AccountPage() {
  const [{ user, memberships }, t] = await Promise.all([requireWorkspace(), getT()]);
  const a = t.account;
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader
        title={a.title}
        description={a.description}
      />
      <Card>
        <CardHeader>
          <CardTitle>{a.profile}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm fullName={user.fullName ?? ""} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{a.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailForm email={user.email ?? ""} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{a.password}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{a.workspaces}</CardTitle>
            <CardDescription>{a.workspacesText}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {memberships.map((m) => (
              <li
                key={m.business.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <span className="font-semibold">{m.business.name}</span>
                <Badge tone={m.role === "owner" ? "brand" : "neutral"}>{t.common.roles[m.role]}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
