/**
 * NORYX design tokens for the app — copied from the website's src/styles/tokens.css
 * (a test keeps them identical). Rose gold and pink ≤ 400 are decorative only.
 */
const palette = {
  white: "#ffffff",
  ivory: "#fbf8f5",
  "neutral-50": "#faf8f6",
  "neutral-100": "#f4f1ee",
  "neutral-200": "#eae4e0",
  "neutral-300": "#ddd5d0",
  "neutral-400": "#b5aca7",
  "neutral-450": "#958b86",
  "neutral-500": "#7c7470",
  "neutral-600": "#6e6764",
  "neutral-700": "#4f4946",
  "neutral-800": "#3a3534",
  "neutral-900": "#292626",
  "neutral-950": "#1c1a1a",
  "champagne-50": "#f9f3ee",
  "champagne-100": "#f4e9df",
  "champagne-200": "#ead8c8",
  "champagne-300": "#dcc2ac",
  "champagne-400": "#c8a88e",
  "rosegold-50": "#fbf5f1",
  "rosegold-100": "#f6e8e0",
  "rosegold-200": "#edd3c5",
  "rosegold-300": "#dfb7a3",
  "rosegold-400": "#c99a85",
  "rosegold-500": "#b07f69",
  "rosegold-600": "#92644f",
  "rosegold-700": "#774e3d",
  "rosegold-800": "#5b3b2e",
  "rosegold-900": "#3e2820",
  "pink-50": "#fdf2f4",
  "pink-100": "#fbe3e8",
  "pink-200": "#f6c9d3",
  "pink-300": "#eea3b3",
  "pink-400": "#e0738a",
  "pink-500": "#d05a76",
  "pink-600": "#c44a68",
  "pink-700": "#b83d5d",
  "pink-800": "#9a2c48",
  "pink-900": "#7a2238",
  "success-50": "#eef7f1",
  "success-100": "#d5eddd",
  "success-500": "#2f9d62",
  "success-600": "#1f7a4b",
  "success-700": "#17603b",
  "warning-50": "#fff7e6",
  "warning-100": "#fce9bf",
  "warning-500": "#d9951a",
  "warning-600": "#a86a05",
  "warning-700": "#85520a",
  "danger-50": "#fef1f0",
  "danger-100": "#fcdcd8",
  "danger-500": "#d94a3d",
  "danger-600": "#c0352b",
  "danger-700": "#9e281f",
  "info-50": "#eff4fa",
  "info-100": "#d9e5f3",
  "info-500": "#4a78b0",
  "info-600": "#3a6194",
  "info-700": "#2e4d77",
} as const;

/** Semantic roles, named as on the website. */
const roles = {
  canvas: palette.white,
  surface: palette.white,
  "surface-subtle": palette.ivory,
  "surface-muted": palette["neutral-100"],
  "surface-warm": palette["champagne-50"],
  fg: palette["neutral-900"],
  "fg-muted": palette["neutral-600"],
  "fg-subtle": palette["neutral-500"],
  "fg-disabled": palette["neutral-400"],
  "fg-inverse": palette.white,
  "fg-accent": palette["rosegold-700"],
  border: palette["neutral-200"],
  "border-strong": palette["neutral-300"],
  "border-control": palette["neutral-450"],
  primary: palette["pink-700"],
  "primary-hover": palette["pink-800"],
  "primary-active": palette["pink-900"],
  "primary-soft": palette["pink-50"],
  "primary-fg": palette.white,
  accent: palette["rosegold-400"],
  "accent-soft": palette["rosegold-100"],
  ring: palette["rosegold-600"],
} as const;

export const colors = {
  ...palette,
  ...roles,
  /** App screens sit on the ivory canvas the website uses for its sections. */
  screen: palette.ivory,
} as const;

export type ColorName = keyof typeof colors;

export const radius = { sm: 6, md: 10, lg: 14, card: 24, sheet: 28, pill: 999 } as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;

/** Soft warm shadow (the website's shadow-md, rgb 58 40 34). */
export const shadow = {
  shadowColor: "#3a2822",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

/** Minimum touch target in points. */
export const TOUCH = 44;
