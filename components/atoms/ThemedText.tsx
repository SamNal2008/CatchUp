import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import {Colors} from "@/constants/design";
import {ColorSchemeName, useColorSchemeOrDefault} from "@/hooks/useColorScheme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'subText' | 'icon' | 'sectionTitle' | 'subSectionTitle' | 'settings';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor('text', { light: lightColor, dark: darkColor });
  const theme = useColorSchemeOrDefault();
  const styles = makeStyles(theme);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'subText' ? styles.subText : undefined,
        type === 'icon' ? styles.icon : undefined,
        type === 'sectionTitle' ? styles.sectionTitle : undefined,
        type === 'subSectionTitle' ? styles.subSectionTitle : undefined,
        type === 'settings' ? styles.settings : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const makeStyles = (theme: ColorSchemeName) => StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'SF Pro',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'SF Pro',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SF Pro',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    fontFamily: 'SF Pro',
    color: Colors[theme].icon,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  subText: {
    fontSize: 12,
    lineHeight: 20,
  },
  icon: {
    fontSize: 72
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'SF Pro',
    color: Colors[theme].icon,
    lineHeight: 16,
    fontStyle: 'normal',
  },
  settings: {
    fontSize: 17,
    color: Colors[theme].text
  }
});
