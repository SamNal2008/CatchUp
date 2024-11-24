import { Alert, Button } from "react-native";
import { useIsAdmin, useToggleAdminMode } from "@/store/Admin.store"
import { logService } from "@/services/log.service";
import { useCheckIns } from "@/contexts/CheckIns.context";
import { useNotifications } from "@/hooks/useNotificatons";
import { useSQLiteContext } from "expo-sqlite";
import { useContacts } from "@/contexts/Contact.context";
import { useNewNoteCheckInModalControl, useNewCheckinInfo } from "@/store/CheckinNote.store";
import React, { useEffect } from "react";
import { useModalRef, MyBottomSheet } from "../navigation/BottomSheet";

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
      .map(friend => friend.id)
      .filter(friendId => friendId !== null && friendId !== undefined)
      .forEach(friendId => deleteFriend(friendId!));
  }

  const wipeAll = () => {
    Alert.alert('Are you sure you want to wipe all databases ?', 'This action is irreversible', [
      {
        text: 'No',
        onPress: () => {
          return;
        }
      },
      {
        text: 'Yes',
        onPress: () => {
          wipeAllDatabases();
        }
      },
    ]);
  }

  const selectAllData = () => {
    logService.log("Contacts: " + db.getAllSync('SELECT * FROM contacts'));
    logService.log("Notifications : "+ db.getAllSync('SELECT * FROM notifications'));
    logService.log("Checkins : " + db.getAllSync('SELECT * FROM check_ins'));
    logService.log('Notifications service : ' + Notifications.getAllScheduledNotificationsAsync().then(logService.log));
  }


    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <Button title="Clear databases" onPress={wipeAll} />
            <Button title={"Select all data in database"} onPress={selectAllData} />
        </>
    );
}

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
    }, [isAdmin]);


    return (
        <MyBottomSheet
            contentToDisplay={<AdminDataSelection/>}
            header={<>
                <Button title="Close" onPress={toggleAdminMode}/>
            </>}
            ref={modalRef}
        />
    );
}