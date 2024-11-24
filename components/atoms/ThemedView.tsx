import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Spacing } from "@/constants/design";
import { ColorSchemeName, useColorSchemeOrDefault } from "@/hooks/useColorScheme";

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
