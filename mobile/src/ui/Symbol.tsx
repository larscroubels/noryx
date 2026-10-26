import { Image } from "react-native";

/** The NORYX X monogram (decorative). */
export function Symbol({ size = 56 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/images/noryx-symbol.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
