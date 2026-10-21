"use client";

import { useT } from "@/i18n/client";
import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Option = { id: string; name: string };

export function BusinessSwitcher({
  current,
  options,
  switchAction,
}: {
  current: Option;
  options: Option[];
  switchAction: (businessId: string) => Promise<void>;
}) {
  const t = useT();
  if (options.length < 2) {
    return <p className="truncate px-2 text-sm font-semibold text-fg">{current.name}</p>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold hover:bg-surface/70">
        <span className="truncate">{current.name}</span>
        <ChevronDown className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>{t.common.switchBusiness}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuItem key={option.id} onSelect={() => void switchAction(option.id)}>
            <span className="flex-1 truncate">{option.name}</span>
            {option.id === current.id && <Check aria-label={t.common.current} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
