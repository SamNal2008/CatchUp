import {useContacts} from "@/contexts/Contact.context";
import React, {createContext, ReactNode, useEffect, useState} from "react";
import {DateUtils} from "@/constants/DateUtils";
import {createNewContactEntity, ReminderFrequency} from "@/repositories";
import {router} from "expo-router";
import {useMyBottomSheet} from "@/contexts/BottomSheetProvider.context";
import {Button, View} from "react-native";
import {NewFriendSettings} from "@/components/organisms/NewFriendSettings";
import {Colors} from "@/constants/design";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";

type NewFriendContextProps = {};

const NewFriendContext = createContext<NewFriendContextProps | null>(null);

export const NewFriendContextProvider = ({children}: { children: ReactNode }) => {
    const {newContact, addNewFriend} = useContacts();
    const {showBottomSheet, closeSheet} = useMyBottomSheet();
    const [contactBirthday, setContactBirthday] = useState<Date>(DateUtils.getBirthDateFromBirthday(newContact) ?? new Date());
    const [contactLastCheckIn, setContactLastCheckIn] = useState<Date>(new Date());
    const [selectedFrequency, setSelectedFrequency] = useState<ReminderFrequency>("weekly");
    const theme = useColorSchemeOrDefault();

    const saveNewFriend = async () => {
        await addNewFriend(createNewContactEntity({
            contact: newContact,
            frequency: selectedFrequency,
            birthDate: contactBirthday,
            lastCheckin: contactLastCheckIn
        }));
        closeSheet();
        router.navigate('/(tabs)/profile');
    };

    useEffect(() => {
        if (newContact) {
            showBottomSheet(
                <>
                    <Button title="Cancel" color={Colors[theme].buttonBackground} onPress={closeSheet}/>
                    <Button title="Save" color={Colors[theme].buttonBackground} onPress={saveNewFriend}/>
                </>,
                <NewFriendSettings
                    frequency={selectedFrequency}
                    setFrequency={setSelectedFrequency}
                    contact={newContact}
                    birthDay={contactBirthday}
                    lastCheckin={contactLastCheckIn}
                    setBirthday={setContactBirthday}
                    setLastCheckin={setContactLastCheckIn}
                />
            );
        } else {
            closeSheet();
        }
    }, [newContact]);

    return (
        <NewFriendContext.Provider value={null}>
            {children}
        </NewFriendContext.Provider>
    )
}