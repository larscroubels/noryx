import { MailPlus, UserMinus, X } from "lucide-react";
import type { Metadata } from "next";

import { ConfirmAction } from "@/components/forms/confirm-action";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n, getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { removeMember, revokeInvitation } from "./actions";
import { InviteForm, MemberAccessDialog } from "./team-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).team.title };
}

export default async function TeamPage() {
  const workspace = await requirePermission("members.manage");
  const { t, intl } = await getI18n();
  const tm = t.team;
  const roles = t.common.roles;
  const { business, user, role } = workspace;
  const supabase = await createClient();
  const [{ data: members }, { data: invitations }, { data: staff }] = await Promise.all([
    supabase.rpc("list_business_members", { p_business_id: business.id }),
    supabase
      .from("business_invitations")
      .select("id, email, role, expires_at, staff_id")
      .eq("business_id", business.id)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("staff_members")
      .select("id, display_name, user_id")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("display_name"),
  ]);
  const staffNames = new Map((staff ?? []).map((s) => [s.id, s.display_name]));
  const isOwner = role === "owner";

  return (
    <div className="grid max-w-5xl gap-8">
      <PageHeader
        title={tm.title}
        description={tm.description}
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-5">
          <div>
            <CardTitle>{tm.members}</CardTitle>
<CardDescription>{tm.membersText}</CardDescription>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{tm.member}</TableHead>
              <TableHead>{tm.role}</TableHead>
              <TableHead className="hidden md:table-cell">{tm.staffProfile}</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">{t.common.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(members ?? []).map((member) => {
              const name = member.full_name || member.email;
              const isSelf = member.user_id === user.id;
              const editable = !isSelf && (isOwner || member.role !== "owner");
              const customised =
                member.granted_permissions.length > 0 || member.revoked_permissions.length > 0;
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {name}{" "}
                          {isSelf && <span className="font-normal text-fg-muted">{tm.you}</span>}
                        </span>
                        <span className="block truncate text-xs text-fg-muted">{member.email}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone={member.role === "owner" ? "brand" : "neutral"}>
                        {roles[member.role]}
                      </Badge>
                      {customised && <Badge tone="gold">{tm.customAccess}</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-fg-muted md:table-cell">
                    {member.staff_id ? (staffNames.get(member.staff_id) ?? tm.linked) : "—"}
                  </TableCell>
                  <TableCell>
                    {editable && (
                      <span className="flex justify-end gap-2">
                        <MemberAccessDialog
                          member={{
                            id: member.id,
                            name,
                            role: member.role,
                            granted_permissions: member.granted_permissions,
                            revoked_permissions: member.revoked_permissions,
                          }}
                          canAssignOwner={isOwner}
                        />
                        <ConfirmAction
                          trigger={<UserMinus aria-label={tm.remove(name)} />}
                          triggerVariant="ghost"
                          title={tm.removeTitle(name)}
                          description={tm.removeText}
                          confirmLabel={tm.removeConfirm}
                          action={removeMember}
                          hiddenFields={{ memberId: member.id }}
                        />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <MailPlus className="size-4 text-fg-muted" aria-hidden="true" /> {tm.invite}
              </CardTitle>
<CardDescription>{tm.inviteText}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InviteForm
              canInviteOwners={isOwner}
              unlinkedStaff={(staff ?? []).filter((s) => !s.user_id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tm.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            {(invitations ?? []).length === 0 ? (
              <p className="text-sm text-fg-muted">{tm.noPending}</p>
            ) : (
              <ul className="divide-y divide-border">
                {(invitations ?? []).map((invite) => (
                  <li key={invite.id} className="flex items-center gap-3 py-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{invite.email}</span>
                      <span className="block text-fg-muted">
                        {roles[invite.role]}
                        {invite.staff_id &&
                          ` · ${staffNames.get(invite.staff_id) ?? tm.staffProfileLower}`}{" "}
                        · {tm.expires(formatDate(invite.expires_at, business.timezone, {}, intl))}
                      </span>
                    </span>
                    <form action={revokeInvitation}>
                      <input type="hidden" name="id" value={invite.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={tm.revoke(invite.email)}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
