import {
  MyBottomSheet,
  useModalRef,
} from "@/components/navigation/BottomSheet";
import { NewFriendSettings } from "@/components/organisms/NewFriendSettings";
import { Colors } from "@/constants/design";
import { useContacts } from "@/contexts/Contact.context";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { createNewContactEntity } from "@/repositories";
import { useNewFriendStore } from "@/store/NewFriend.store";
import { router } from "expo-router";
import React, { createContext, ReactNode, useEffect } from "react";
import { Button } from "react-native";

type NewFriendContextProps = Record<never, never>;

const NewFriendContext = createContext<NewFriendContextProps | null>(null);

export const NewFriendContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { addNewFriend } = useContacts();
  const modalRef = useModalRef();
  const theme = useColorSchemeOrDefault();
  const {
    contactBirthday,
    contact,
    contactLastCheckIn,
    selectedFrequency,
    reset,
  } = useNewFriendStore();

  const saveNewFriend = async () => {
    await addNewFriend(
      createNewContactEntity({
        contact,
        frequency: selectedFrequency,
        birthDate: contactBirthday,
        lastCheckin: contactLastCheckIn,
      }),
    );
    reset();
    modalRef.current?.close();
    router.navigate("/(tabs)/friends");
  };

  const closeModal = () => {
    reset();
  };

  useEffect(() => {
    if (contact) {
      modalRef.current?.expand();
    } else {
      modalRef.current?.close();
    }
  }, [contact, modalRef]);

  return (
    <NewFriendContext.Provider value={{ saveNewFriend, closeModal }}>
      {children}
      <MyBottomSheet
        ref={modalRef}
        contentToDisplay={<NewFriendSettings />}
        header={
          <>
            <Button
              title="Cancel"
              color={Colors[theme].buttonBackground}
              onPress={closeModal}
            />
            <Button
              title="Save"
              color={Colors[theme].buttonBackground}
              onPress={saveNewFriend}
            />
          </>
        }
      />
    </NewFriendContext.Provider>
  );
};
