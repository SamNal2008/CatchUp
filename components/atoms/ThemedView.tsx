import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Header } from "@/components/organisms/Header";
import {ColorSchemeName, useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {Colors, Size, Spacing} from "@/constants/design";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
    const theme = useColorSchemeOrDefault();
    const styles = makeStyles(theme);
    return (
        <View style={[styles.default, style]}>
            {otherProps.children}
        </View>
    );
}

const makeStyles = (theme: ColorSchemeName) => StyleSheet.create({
    default: {
        backgroundColor: Colors[theme].background,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Spacing.medium,
        paddingHorizontal: Spacing.medium,
        width: '100%',
    },
});
