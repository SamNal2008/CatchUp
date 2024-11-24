import { useCheckIns } from "@/contexts/CheckIns.context";
import { useContacts } from "@/contexts/Contact.context";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { useNotifications } from "@/hooks/useNotificatons";
import { ContactModel } from "@/repositories";
import { useNewCheckinInfo, useSetContactToCheckin } from "@/store/CheckinNote.store";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View, Text } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { PrimaryButton } from "../atoms/PrimaryButton";
import { ThemedText } from "../atoms/ThemedText";
import { CheckInToast } from "../organisms/CheckInToast";
import { InitialImage } from "./InitialImage";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Palette } from "@/constants/design";

type RightActionProps = {
    onPress: () => void;
    prog: SharedValue<number>;
    drag: SharedValue<number>;
}
  

const RightAction = ({drag, onPress, prog}: RightActionProps) => {
    const theme = useColorSchemeOrDefault();
    const styleAnimation = useAnimatedStyle(() => {
      const showRightProgress = prog.value > 0;
      const appliedTranslation = drag.value + 50;
  
      return {
        transform: [{ translateX: appliedTranslation }],
        opacity: showRightProgress ? 1 : 0,
        backgroundColor: showRightProgress ? Palette.RED : Colors[theme].background
      };
    });
  
    return (
      <Reanimated.View style={[styleAnimation]}>
        <Pressable onPress={onPress} style={deleteStyles.deleteButton}>
          <Text style={deleteStyles.deleteButtonText}>Delete</Text>
        </Pressable>
      </Reanimated.View>
    );
  }

  const deleteStyles = StyleSheet.create({
    deleteButton: {
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButtonText: {
      color: Palette.WHITE,
      fontSize: 16,
    },
  });

export const FriendLine = ({ contact }: { contact: ContactModel }) => {
    const { deleteFriend, friends } = useContacts();
    const { getLatestCheckInForContact } = useCheckIns();
    const { askForNotificationPermission } = useNotifications();
  
    const [isOnDeleteMode, setIsOnDeleteMode] = useState<boolean>(false);
    const toggleDeleteFriend = () => {
      setIsOnDeleteMode((prev) => !prev);
    };
  
    const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
    const [reload, setReload] = useState<boolean>(false);
    const setContactToCheckin = useSetContactToCheckin();
    const {contactToCheckin} = useNewCheckinInfo();
  
    const isCheckingOnContact = contactToCheckin?.id === contact.id;
  
    useEffect(() => {
      if (friends.length > 0) {
        askForNotificationPermission();
      }
    }, []);
  
    useEffect(() => {
      if (!contact.id) {
        return;
      }
      setLastCheckedIn(getLatestCheckInForContact(contact.id));
    }, [contact.id, reload]);
  
    const confirmDelete = (promptResponse: string) => {
      if (promptResponse.toLowerCase() === contact.firstName?.toLowerCase()) {
        removeFriend();
        return;
      }
      alert('Friend deletion cancelled');
    }
  
    const removeFriend = () => {
      if (!contact.id) {
        alert('Unable to delete friend without id');
        return;
      }
      deleteFriend(contact.id);
    }
  
    const checkInOnFriend = () => {
      if (!contact.id) {
        alert('Unable to check in on friend without id');
        return;
      }
      setContactToCheckin(contact);
    }
  
    const hasAlreadyCheckedIn = !!lastCheckedIn;
  
    const toDaysAgo = hasAlreadyCheckedIn ? Math.round((new Date().getTime() - lastCheckedIn?.getTime()) / (1000 * 3600 * 24)) : null;
    const hasCheckedInToday = hasAlreadyCheckedIn && toDaysAgo! < 1;
  
    return (
        <Swipeable renderRightActions={(progress, drag) => <RightAction drag={drag} prog={progress} onPress={toggleDeleteFriend} />}>
        <View style={[styles.friendContainer]}>
          <View style={styles.friendNameContainer}>
            {contact.image ?
              <Image source={contact.image} style={styles.friendImage} /> :
              <InitialImage firstName={contact.firstName} lastName={contact.lastName} size={50}/>}
            <View>
              <ThemedText style={styles.friendName}>{contact.firstName}</ThemedText>
              {hasAlreadyCheckedIn ?
                <ThemedText type="subText">{hasCheckedInToday ? "Checked in today" : `Checked in ${toDaysAgo} days ago`}</ThemedText>
                  :
                <ThemedText type="subText">Never checked in yet !</ThemedText>
              }
            </View>
          </View>
          <PrimaryButton disabled={hasCheckedInToday} title={hasCheckedInToday ? 'Come later' : 'Check In'} onPress={checkInOnFriend} />
          <CheckInToast checkedInContact={contact} isVisible={isCheckingOnContact}/>
        </View>
      </Swipeable>
    )
  }

const styles = StyleSheet.create({
    rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
    friendNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      friendName: {
        fontSize: 16,
        fontWeight: 'bold'
      },
      friendImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
      },
      friendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
      },
});