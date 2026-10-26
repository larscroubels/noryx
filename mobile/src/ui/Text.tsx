import { Text as RNText, type TextProps, type TextStyle } from "react-native";

import { fonts } from "~/theme/fonts";
import { colors, type ColorName } from "~/theme/tokens";

const VARIANTS = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof VARIANTS;

/** Text in the NORYX type scale; follows the system text size. */
export function Text({
  variant = "body",
  color = "fg",
  style,
  ...props
}: TextProps & { variant?: TextVariant; color?: ColorName }) {
  return (
    <RNText
      allowFontScaling
      {...props}
      style={[VARIANTS[variant], { color: colors[color] }, style]}
    />
  );
}
