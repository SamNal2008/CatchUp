import {StyleSheet, View} from 'react-native';

import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useContacts} from "@/hooks/useContacts";
import {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {

    const {contacts} = useContacts();

    useEffect(() => {
        AsyncStorage.getItem('contacts').then((contacts) => {
            console.log('Contacts', contacts);
        });
    }, []);

    return (
        <ThemedView>
            <View style={styles.container}>
            <ThemedText type={'subtitle'}>{contacts.length} Lorem ipsum dolor sit amet, consectetur adipiscing elit.</ThemedText>
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
