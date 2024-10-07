import {ScrollView, StyleSheet, View, type ViewProps} from 'react-native';

import {useThemeColor} from '@/hooks/useThemeColor';
import {Header} from "@/components/Header";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({style, lightColor, darkColor, ...otherProps}: ThemedViewProps) {
    const backgroundColor = useThemeColor({light: lightColor, dark: darkColor}, 'background');
    return (
        <ScrollView contentContainerStyle={[{backgroundColor}, styles.default]}>
            <Header />
            <View style={styles.content}>
                {otherProps.children}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    default: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
    },
    content: {
        flex: 4,
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '100%'
    }
});
