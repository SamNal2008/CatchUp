import {ThemedText} from "@/components/ThemedText";
import {AntDesign} from "@expo/vector-icons";
import {StyleSheet, useColorScheme, View} from "react-native";
import * as Contacts from 'expo-contacts';
import { Colors } from "@/constants/Colors";
import { useContacts } from "@/contexts/Contact.context";


export const Header = () => {

    const theme = useColorScheme() ?? 'light';
    const {setNewContact} = useContacts();


    const openModalToChoseContact = async () => {
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const newCatchUp = await Contacts.presentContactPickerAsync();
            if (newCatchUp) {
                setNewContact(newCatchUp);
                return;
            }
        } else {
            alert('Permission refusée');
        }
    }

    return (<View style={styles.header}>
        <ThemedText type={'subtitle'}>Catchup</ThemedText>
        <AntDesign size={36} color={Colors[theme].icon} onPress={openModalToChoseContact} name={'pluscircle'}/>
    </View>);
}

const styles = StyleSheet.create({
    header: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
});