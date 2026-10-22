"use client";

import { Check, Copy, Settings2 } from "lucide-react";
import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { ALL_PERMISSIONS, effectivePermissions, type MemberRole } from "@/lib/auth/permissions";

import { inviteMember, saveMemberAccess, type InviteState } from "./actions";

export function InviteForm({
  canInviteOwners,
  unlinkedStaff,
}: {
  canInviteOwners: boolean;
  unlinkedStaff: { id: string; display_name: string }[];
}) {
  const [state, action] = useActionState<InviteState, FormData>(inviteMember, IDLE);
  const [copied, setCopied] = useState(false);
  const t = useT();
  const f = t.team.form;
  const roles = t.common.roles;

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.status === "error" && <FormAlert state={state} />}
      {state.status === "success" && state.inviteUrl && (
        <Alert tone="success" title={f.ready}>
          <p>{state.message}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={state.inviteUrl} aria-label={f.link} className="bg-white" />
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(state.inviteUrl!);
                setCopied(true);
              }}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? t.common.copied : t.common.copyLink}
            </Button>
          </div>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <Field label={f.email} error={fieldError(state, "email")} required>
          <Input name="email" type="email" autoComplete="off" placeholder="name@example.com" />
        </Field>
        <Field label={t.team.role} error={fieldError(state, "role")}>
          <Select name="role" defaultValue="staff">
            <option value="staff">{roles.staff}</option>
            <option value="manager">{roles.manager}</option>
            {canInviteOwners && <option value="owner">{roles.owner}</option>}
          </Select>
        </Field>
      </div>
      <Field
        label={f.linkStaff}
        hint={f.linkStaffHint}
        error={fieldError(state, "staffId")}
        optional
      >
        <Select name="staffId" defaultValue="">
          <option value="">{f.noStaff}</option>
          {unlinkedStaff.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.display_name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex justify-end">
        <SubmitButton>{f.create}</SubmitButton>
      </div>
    </form>
  );
}

export function MemberAccessDialog({
  member,
  canAssignOwner,
  customPermissions,
}: {
  member: {
    id: string;
    name: string;
    role: MemberRole;
    granted_permissions: string[];
    revoked_permissions: string[];
  };
  canAssignOwner: boolean;
  /** Per-member permission changes are part of Pro. */
  customPermissions: boolean;
}) {
  const [state, action] = useActionState(saveMemberAccess, IDLE);
  const [role, setRole] = useState<MemberRole>(member.role);
  const t = useT();
  const f = t.team.form;
  const roles = t.common.roles;
  const current = effectivePermissions({
    role: member.role,
    grantedPermissions: member.granted_permissions,
    revokedPermissions: member.revoked_permissions,
  });
  const defaults = effectivePermissions({ role });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Settings2 aria-hidden="true" /> {f.access}
        </Button>
      </DialogTrigger>
      <DialogContent title={f.accessFor(member.name)} description={f.accessText} size="lg">
        <form action={action} className="grid gap-5" noValidate>
          <input type="hidden" name="memberId" value={member.id} />
          <FormAlert state={state} />
          <Field label={t.team.role}>
            <Select
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as MemberRole)}
            >
              <option value="staff">{roles.staff}</option>
              <option value="manager">{roles.manager}</option>
              {(canAssignOwner || member.role === "owner") && (
                <option value="owner">{roles.owner}</option>
              )}
            </Select>
          </Field>
          {role === "owner" ? (
            <p className="text-sm text-fg-muted">{f.ownersAll}</p>
          ) : (
            <fieldset
              className="grid gap-3 sm:grid-cols-2"
              key={role}
              disabled={!customPermissions}
            >
              <legend className="mb-2 text-sm font-semibold">{f.permissions}</legend>
              {!customPermissions && (
                <p className="text-sm text-fg-muted sm:col-span-2">{f.permissionsPro}</p>
              )}
              {ALL_PERMISSIONS.map((permission) => {
                const id = `${member.id}-${permission}`;
                const checked =
                  customPermissions && role === member.role
                    ? current.has(permission)
                    : defaults.has(permission);
                return (
                  <ChoiceRow
                    key={permission}
                    htmlFor={id}
                    control={
                      <Checkbox
                        id={id}
                        name="permissions"
                        value={permission}
                        defaultChecked={checked}
                      />
                    }
                    label={t.team.permissions[permission]}
                    description={defaults.has(permission) ? f.inRole : undefined}
                  />
                );
              })}
            </fieldset>
          )}
          <DialogFooter>
            <SubmitButton>{f.save}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
