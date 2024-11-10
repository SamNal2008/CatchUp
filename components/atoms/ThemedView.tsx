import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Header } from "@/components/organisms/Header";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
    const backgroundColor = useThemeColor('background', { light: lightColor, dark: darkColor });
    return (
        <ScrollView contentContainerStyle={[{ backgroundColor }, styles.default]}>
            <View style={[styles.content, style]}>
                {otherProps.children}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    default: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    content: {
        flex: 4,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%'
    }
});
