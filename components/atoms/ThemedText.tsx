import { StyleSheet, Text, type TextProps } from "react-native";

import { Colors } from "@/constants/design";
import {
  ColorSchemeName,
  useColorSchemeOrDefault,
} from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
  | "default"
  | "title"
  | "defaultSemiBold"
  | "subtitle"
  | "link"
  | "footNote"
  | "icon"
  | "sectionTitle"
  | "subSectionTitle"
  | "text"
  | "title3"
  | "settings";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor("text", { light: lightColor, dark: darkColor });
  const theme = useColorSchemeOrDefault();
  const styles = makeStyles(theme);

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "footNote" ? styles.footNote : undefined,
        type === "icon" ? styles.icon : undefined,
        type === "sectionTitle" ? styles.sectionTitle : undefined,
        type === "subSectionTitle" ? styles.subSectionTitle : undefined,
        type === "settings" ? styles.settings : undefined,
        type === "text" ? styles.text : undefined,
        type === "title3" ? styles.title3 : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    default: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
    },
    defaultSemiBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
      fontFamily: "SF Pro",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      lineHeight: 32,
      fontFamily: "SF Pro",
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "bold",
      fontFamily: "SF Pro",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 21,
      fontFamily: "SF Pro",
      color: Colors[theme].icon,
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
      color: "#0a7ea4",
    },
    footNote: {
      fontFamily: "Inter",
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
    },
    icon: {
      fontSize: 72,
    },
    subSectionTitle: {
      fontSize: 13,
      fontWeight: "400",
      fontFamily: "SF Pro",
      color: Colors[theme].icon,
      lineHeight: 16,
      fontStyle: "normal",
    },
    settings: {
      fontSize: 17,
      color: Colors[theme].text,
    },
    text: {
      fontFamily: "Inter",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24,
    },
    title3: {
      fontFamily: "Inter",
      fontWeight: "600",
      fontSize: 20,
      lineHeight: 24,
    },
  });
