import {Image, StyleSheet, Platform, View} from 'react-native';

import {HelloWave} from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';

export default function HomeScreen() {
    return (
        <ThemedView>
            <View style={styles.container}>
            <ThemedText type={'subtitle'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</ThemedText>
            <ThemedText type={'default'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20
    }
});
