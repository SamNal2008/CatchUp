import { ThemedText } from "@/components/atoms/ThemedText";
import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import * as Contacts from 'expo-contacts';
import { Colors } from "@/constants/design/Colors";
import { useContacts } from "@/contexts/Contact.context";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";


export const Header = () => {

    const theme = useColorSchemeOrDefault();
    const { setNewContact } = useContacts();


    const openModalToChoseContact = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission refusée');
            return;
        }
        let newCatchUp = await Contacts.presentContactPickerAsync();
        if (newCatchUp) {
            const res = await Contacts.getContactsAsync({ fields: [Contacts.Fields.ID, Contacts.Fields.Image] });
            newCatchUp = {
                ...newCatchUp,
                image: res.data.find((contact) => contact.id === newCatchUp?.id)?.image
            }
            setNewContact(newCatchUp);
        }
    }

    return (<View style={styles.header}>
        <ThemedText type={'subtitle'} style={{ fontSize: 24 }}>Catchup</ThemedText>
        <AntDesign size={46} suppressHighlighting color={Colors[theme].icon} onPress={openModalToChoseContact} name={'pluscircle'} />
    </View>);
}

const styles = StyleSheet.create({
    header: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
});