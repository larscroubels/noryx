import {
  CalendarDays,
  Globe,
  Rocket,
  Scissors,
  Settings,
  ShoppingBag,
  UsersRound,
  Wallet,
} from "lucide-react";

import type { HelpCourse } from "@/content/help";

const ICONS = {
  rocket: Rocket,
  calendar: CalendarDays,
  globe: Globe,
  users: UsersRound,
  scissors: Scissors,
  shopping: ShoppingBag,
  wallet: Wallet,
  settings: Settings,
} as const;

export function HelpIcon({ icon, className }: { icon: HelpCourse["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden="true" />;
}
