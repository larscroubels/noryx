"use client";

import { useT } from "@/i18n/client";
import { ChevronsUpDown, LogOut, Store, UserRound } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  name,
  email,
  roleLabel,
  signOutAction,
}: {
  name: string;
  email: string | null;
  roleLabel: string;
  signOutAction: () => Promise<void>;
}) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-surface/70">
        <Avatar name={name} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg">{name}</span>
          <span className="block truncate text-xs text-fg-muted">{roleLabel}</span>
        </span>
        <ChevronsUpDown className="size-4 text-fg-subtle" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-60">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/app/account">
            <UserRound /> {t.common.accountSettings}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/onboarding?new=1">
            <Store /> {t.common.addBusiness}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOutAction()}>
          <LogOut /> {t.common.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
