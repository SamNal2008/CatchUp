import {ThemedText} from "@/components/ThemedText";
import {ScrollView, StyleSheet, View} from "react-native";
import {Colors} from "@/constants/Colors";
import {Button, Checkbox} from "react-native-ui-lib";
import React, {useEffect, useState} from "react";
import * as Contacts from 'expo-contacts';
import {Fields} from 'expo-contacts';
import {useContacts} from "@/hooks/useContacts";
import {router} from "expo-router";

export default function ContactsModal() {

    const {saveContact, contacts: savedContact} = useContacts();

    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contacts.Contact[]>([]);

    const closeAndSaveContacts = () => {
        saveContact(selectedContacts);
        router.navigate('./(tabs)/');
    }

    const selectContact = (contact: Contacts.Contact) => {
        if (selectedContacts.indexOf(contact) >= 0) {
            setSelectedContacts(selectedContacts.filter((c) => c !== contact));
            return;
        }
        setSelectedContacts([...selectedContacts, contact]);
    };

    useEffect(() => {
        (async () => {
            console.log('toto');
            const {status} = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const {data} = await Contacts.getContactsAsync({
                    fields: [Fields.FirstName, Fields.LastName, Fields.PhoneNumbers, Fields.ID],
                });
                if (data.length > 0) {
                    setContacts(data);
                    setSelectedContacts(data.filter((contact) => savedContact.indexOf(contact) >= 0));
                }
            }
        })();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.modal}>
            <ThemedText type={'title'}>Choisissez un contact</ThemedText>
            <ThemedText>Pick your catchups</ThemedText>
            {contacts.map((contact) => {
                return (
                    <View key={contact.id} style={styles.contactList}>
                        <Checkbox value={selectedContacts.indexOf(contact) >= 0}
                                  onValueChange={() => selectContact(contact)}/>
                        <ThemedText key={contact.id}>{contact.name}</ThemedText>
                    </View>
                );
            })}
            <Button label={'Close'} backgroundColor={Colors.light.tint} onPress={closeAndSaveContacts}/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: Colors.light.background,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: 10,
    },
    contactList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        width: '100%',
        paddingLeft: 20
    }
});