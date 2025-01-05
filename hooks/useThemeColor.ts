/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/design/Colors";
import { useColorSchemeOrDefault } from "./useColorScheme";

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props: { light?: string; dark?: string } = {
    light: undefined,
    dark: undefined,
  },
) {
  const theme = useColorSchemeOrDefault();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
