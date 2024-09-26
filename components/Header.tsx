import {ThemedText} from "@/components/ThemedText";
import {AntDesign} from "@expo/vector-icons";
import {StyleSheet, View} from "react-native";
import { router } from 'expo-router';

export const Header = () => {

    const openModalToChoseContact = () => {
        router.navigate('../contacts-modal');
    }

    return (<View style={styles.header}>
        <ThemedText type={'defaultSemiBold'}>Catchup</ThemedText>
        <AntDesign size={28} onPress={openModalToChoseContact} name={'pluscircle'}/>
    </View>);
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
    },
});