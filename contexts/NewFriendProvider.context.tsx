import {
  MyBottomSheet,
  useModalRef,
} from "@/components/navigation/BottomSheet";
import { NewFriendSettings } from "@/components/organisms/NewFriendSettings";
import { DateUtils } from "@/constants/DateUtils";
import { Colors } from "@/constants/design";
import { useContacts } from "@/contexts/Contact.context";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { createNewContactEntity } from "@/repositories/contacts/ContactEntity";
import { logService } from "@/services/log.service";
import { ContactEditMode, useNewFriendStore } from "@/store/NewFriend.store";
import { router } from "expo-router";
import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import { Button } from "react-native";

type NewFriendContextProps = {
  saveContact: () => Promise<void>;
  closeModal: () => void;
  isExistingContact: boolean;
  openContactModal: (contactFromPhone: any) => void;
};

export const NewFriendContext = createContext<NewFriendContextProps | null>(
  null,
);

export const NewFriendContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { addNewFriend, updateFriend, friends } = useContacts();
  const modalRef = useModalRef();
  const theme = useColorSchemeOrDefault();
  const {
    contactBirthday,
    contact,
    contactLastCheckIn,
    selectedFrequency,
    reset,
    editMode,
    initializeFromExistingContact,
    setEditMode,
    setContactBirthday,
    setContact,
  } = useNewFriendStore();

  /**
   * Opens the contact modal with proper initialization
   */
  const openContactModal = useCallback(
    (contactFromPhone: any) => {
      if (!contactFromPhone) return;

      // Reset store to ensure clean state
      reset();

      // Find if contact exists in database
      const existingContact = friends.find((f) => f.id === contactFromPhone.id);

      if (existingContact) {
        // Initialize with database data for existing contacts
        logService.info(`Loading existing contact: ${contactFromPhone.id}`);
        initializeFromExistingContact(existingContact);
      } else {
        // Initialize as new contact
        logService.info(`Setting up new contact: ${contactFromPhone.id}`);
        setContact(contactFromPhone);
        setEditMode(ContactEditMode.CREATE);

        // Try to import birthday from contact data
        if (contactFromPhone.birthday) {
          const birthDate =
            DateUtils.getBirthDateFromBirthday(contactFromPhone);
          if (birthDate) {
            setContactBirthday(birthDate);
          }
        }
      }

      modalRef.current?.expand();
    },
    [
      reset,
      friends,
      initializeFromExistingContact,
      setContact,
      setEditMode,
      setContactBirthday,
      modalRef,
    ],
  );

  const isExistingContact = useMemo(() => {
    return editMode === ContactEditMode.UPDATE;
  }, [editMode]);

  /**
   * Saves the contact to the database
   */
  const saveContact = useCallback(async () => {
    if (!contact) {
      logService.error("No contact to save");
      return;
    }

    try {
      // Create contact entity with validated data
      const contactEntity = createNewContactEntity({
        contact,
        frequency: selectedFrequency,
        birthDate: contactBirthday instanceof Date ? contactBirthday : null,
        lastCheckin:
          contactLastCheckIn instanceof Date ? contactLastCheckIn : new Date(),
      });

      // Determine if contact exists in database
      const contactExistsInDb = !!friends.find(
        (friend) => friend.id === contact.id,
      );

      // Save to database
      if (contactExistsInDb) {
        await updateFriend(contactEntity);
      } else {
        await addNewFriend(contactEntity);
      }

      // Success - reset and close
      reset();
      modalRef.current?.close();
      router.navigate("/(tabs)/friends");
    } catch (error) {
      const action = isExistingContact ? "update" : "add";
      logService.error(`Failed to ${action} contact:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to ${action} contact: ${errorMessage}`);
    }
  }, [
    contact,
    selectedFrequency,
    contactBirthday,
    contactLastCheckIn,
    isExistingContact,
    updateFriend,
    addNewFriend,
    reset,
    modalRef,
    friends,
  ]);

  /**
   * Closes the modal and resets state
   */
  const closeModal = useCallback(() => {
    reset();
    modalRef.current?.close();
  }, [reset, modalRef]);

  const contextValue = useMemo(
    () => ({
      saveContact,
      closeModal,
      isExistingContact,
      openContactModal,
    }),
    [saveContact, closeModal, isExistingContact, openContactModal],
  );

  return (
    <NewFriendContext.Provider value={contextValue}>
      {children}
      <MyBottomSheet
        ref={modalRef}
        contentToDisplay={<NewFriendSettings />}
        snapPoints={["50%", "65%"]}
        header={
          <>
            <Button
              title="Cancel"
              color={Colors[theme].buttonBackground}
              onPress={closeModal}
            />
            <Button
              title={isExistingContact ? "Update" : "Add"}
              color={Colors[theme].buttonBackground}
              onPress={saveContact}
            />
          </>
        }
      />
    </NewFriendContext.Provider>
  );
};
