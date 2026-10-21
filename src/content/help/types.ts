/**
 * Help-centre courses. Every course exists in each interface language with the
 * same slugs, step count and screenshots (enforced by help.test.ts).
 *
 * Screenshots are real captures of the demo workspace, stored per language in
 * public/help/<locale>/<name>.webp at 1440×900 (desktop) or 390×844 (mobile).
 */

export type HelpIcon =
  | "rocket"
  | "calendar"
  | "globe"
  | "users"
  | "scissors"
  | "shopping"
  | "wallet"
  | "settings";

export type HelpAudience = "owner" | "team" | "everyone";

export type HelpImage = {
  /** File name without extension in public/help/<locale>/. */
  name: string;
  alt: string;
  mobile?: boolean;
};

export type HelpStep = {
  title: string;
  /** Paragraphs; **bold** marks the exact button or menu name. */
  body: string[];
  image?: HelpImage;
  tip?: string;
};

export type HelpFaq = { q: string; a: string };

export type HelpCourse = {
  slug: string;
  icon: HelpIcon;
  audience: HelpAudience;
  minutes: number;
  title: string;
  summary: string;
  steps: HelpStep[];
  faq: HelpFaq[];
};

export type HelpContent = {
  courses: HelpCourse[];
  /** Questions shown on the help-centre home page. */
  faq: HelpFaq[];
};
