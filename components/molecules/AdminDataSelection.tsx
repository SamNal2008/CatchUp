import { useCheckIns } from "@/contexts/CheckIns.context";
import { useContacts } from "@/contexts/Contact.context";
import { useNotifications } from "@/hooks/useNotificatons";
import { logService } from "@/services/log.service";
import { useIsAdmin, useToggleAdminMode } from "@/store/Admin.store";
import * as Notifications from "expo-notifications";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect } from "react";
import { Alert, Button } from "react-native";
import { MyBottomSheet, useModalRef } from "../navigation/BottomSheet";

const AdminDataSelection = () => {
  const { friends, deleteFriend } = useContacts();
  const { clearAllCheckIns } = useCheckIns();
  const { clearAllNotifications } = useNotifications();
  const db = useSQLiteContext();
  const isAdmin = useIsAdmin();

  const wipeAllDatabases = () => {
    clearAllCheckIns();
    clearAllNotifications();
    friends
      .map((friend) => friend.id)
      .filter((friendId) => friendId !== null && friendId !== undefined)
      .forEach((friendId) => deleteFriend(friendId!));
  };

  const wipeAll = () => {
    Alert.alert(
      "Are you sure you want to wipe all databases ?",
      "This action is irreversible",
      [
        {
          text: "No",
          onPress: () => {
            return;
          },
        },
        {
          text: "Yes",
          onPress: () => {
            wipeAllDatabases();
          },
        },
      ],
    );
  };

  const selectAllData = () => {
    logService.debug("Contacts: " + db.getAllSync("SELECT * FROM contacts"));
    logService.debug(
      "Notifications : " + db.getAllSync("SELECT * FROM notifications"),
    );
    logService.debug("Checkins : " + db.getAllSync("SELECT * FROM check_ins"));
    logService.debug(
      "Notifications service : " +
        Notifications.getAllScheduledNotificationsAsync().then(logService.log),
    );
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button title="Clear databases" onPress={wipeAll} />
      <Button
        title="Generate sentry error"
        onPress={() => {
          throw new Error("Click");
        }}
      />
      <Button title={"Select all data in database"} onPress={selectAllData} />
    </>
  );
};

export const AdminModal = () => {
  const modalRef = useModalRef();
  const isAdmin = useIsAdmin();
  const toggleAdminMode = useToggleAdminMode();

  useEffect(() => {
    if (isAdmin) {
      modalRef.current?.expand();
    } else {
      modalRef.current?.close();
    }
  }, [isAdmin, modalRef]);

  return (
    <MyBottomSheet
      contentToDisplay={<AdminDataSelection />}
      header={
        <>
          <Button title="Close" onPress={toggleAdminMode} />
        </>
      }
      ref={modalRef}
    />
  );
};
