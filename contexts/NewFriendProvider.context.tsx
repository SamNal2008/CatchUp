import {useContacts} from "@/contexts/Contact.context";
import React, {createContext, ReactNode, useEffect} from "react";
import {createNewContactEntity} from "@/repositories";
import {router} from "expo-router";
import {MyBottomSheet, useModalRef} from "@/components/navigation/BottomSheet";
import {Button} from "react-native";
import {NewFriendSettings} from "@/components/organisms/NewFriendSettings";
import {Colors} from "@/constants/design";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";
import {useNewFriendStore} from "@/store/NewFriend.store";

type NewFriendContextProps = {};

const NewFriendContext = createContext<NewFriendContextProps | null>(null);

export const NewFriendContextProvider = ({children}: { children: ReactNode }) => {
    const {addNewFriend} = useContacts();
    const modalRef = useModalRef();
    const theme = useColorSchemeOrDefault();
    const {setContactBirthday, contactBirthday, contact, setContactLastCheckIn, contactLastCheckIn, setContact, setSelectedFrequency, selectedFrequency, reset} = useNewFriendStore();

    const saveNewFriend = async () => {
        await addNewFriend(createNewContactEntity({
            contact,
            frequency: selectedFrequency,
            birthDate: contactBirthday,
            lastCheckin: contactLastCheckIn
        }));
        reset();
        modalRef.current?.close();
        router.navigate('/(tabs)/friends');
    };

    const closeModal = () => {
        reset();
    }

    useEffect(() => {
        if (contact) {
            modalRef.current?.expand();
        } else {
            modalRef.current?.close();
        }
    }, [contact]);


    return (
        <NewFriendContext.Provider value={null}>
            {children}
            <MyBottomSheet
                ref={modalRef}
                contentToDisplay={
                <NewFriendSettings />
            } header={
                <>
                    <Button title="Cancel" color={Colors[theme].buttonBackground} onPress={closeModal}/>
                    <Button title="Save" color={Colors[theme].buttonBackground} onPress={saveNewFriend}/>
                </>
            }/>
        </NewFriendContext.Provider>
    )
}