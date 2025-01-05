import { useColorScheme } from "react-native";
export const LIGHT = "light";
export const DARK = "dark";

export type ColorSchemeName = typeof LIGHT | typeof DARK;

export const useColorSchemeOrDefault = (): ColorSchemeName => {
  const colorScheme = useColorScheme();
  return colorScheme ?? LIGHT;
};
