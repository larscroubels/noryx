import type { ReactNode } from "react";
import Svg, { Circle, Path } from "react-native-svg";

import type { ClientCategory } from "./api";

/**
 * The website's category icons (src/components/marketing/app-showcase/category-icons.tsx):
 * one 24×24 grid, 1.5 stroke, round caps and joins, like the lucide icons. Decorative —
 * the label next to them carries the meaning.
 */
const PATHS: Record<ClientCategory, ReactNode> = {
  hair: (
    <>
      <Circle cx="6.5" cy="17.5" r="2.75" />
      <Circle cx="17.5" cy="17.5" r="2.75" />
      <Path d="M8.6 15.7 15.6 3.5" />
      <Path d="M15.4 15.7 8.4 3.5" />
    </>
  ),
  nails: (
    <>
      <Path d="M8 21.5V9.5a4 4 0 0 1 8 0v12" />
      <Path d="M10.2 10a1.8 1.8 0 0 1 3.6 0v2.6a1.8 1.8 0 0 1-3.6 0Z" />
      <Path d="M18.5 3.5v2M17.5 4.5h2" />
    </>
  ),
  beauty: (
    <>
      <Path d="M12 2.75c-3.9 0-6.5 3-6.5 7.3 0 4.7 2.9 9.4 6.5 11.2 3.6-1.8 6.5-6.5 6.5-11.2 0-4.3-2.6-7.3-6.5-7.3Z" />
      <Path d="M8.6 10.8c.7.6 1.6.6 2.3 0M13.1 10.8c.7.6 1.6.6 2.3 0" />
      <Path d="M10.6 15.6c.9.6 1.9.6 2.8 0" />
    </>
  ),
  brows: (
    <>
      <Path d="M4 8.5c2.6-2.4 6.2-3.1 9.8-2 1.6.5 3 1.3 4.2 2.4" />
      <Path d="M4.5 15c2-2.6 4.6-3.9 7.5-3.9s5.5 1.3 7.5 3.9c-2 2.6-4.6 3.9-7.5 3.9S6.5 17.6 4.5 15Z" />
      <Circle cx="12" cy="15" r="1.7" />
    </>
  ),
  lashes: (
    <>
      <Path d="M4 10.5c2.3 3 5 4.5 8 4.5s5.7-1.5 8-4.5" />
      <Path d="M6.6 13.2 5.2 15.6M9.5 14.6l-.7 2.7M12 15v2.8M14.5 14.6l.7 2.7M17.4 13.2l1.4 2.4" />
    </>
  ),
  other: (
    <>
      <Path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z" />
      <Path d="M18.5 16v4M16.5 18h4" />
    </>
  ),
};

export function CategoryIcon({
  category,
  size = 24,
  color,
  testID,
}: {
  category: ClientCategory;
  size?: number;
  color: string;
  testID?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {PATHS[category]}
    </Svg>
  );
}
