import { PrimaryButton } from "@/components";
import { Palette } from "@/constants/design";
import { useCheckIns } from "@/contexts/CheckIns.context";
import { useContacts } from "@/contexts/Contact.context";
import { useNewFriendProvider } from "@/hooks/useNewFriendProvider";
import { ContactModel } from "@/repositories";
import { useSetContactToCheckin } from "@/store/CheckinNote.store";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ThemedText } from "../atoms/ThemedText";
import { InitialImage } from "./InitialImage";

type RightActionProps = {
  onPress: () => void;
  progress: SharedValue<number>;
  drag: SharedValue<number>;
};

const RightAction = ({ drag, onPress, progress }: RightActionProps) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 60 }],
      opacity: progress.value,
    };
  });

  return (
    <Reanimated.View style={[deleteStyles.container, styleAnimation]}>
      <Pressable onPress={onPress} testID="delete-friend-button">
        <SymbolView name="trash.fill" size={32} tintColor={Palette.WHITE} />
      </Pressable>
    </Reanimated.View>
  );
};

const deleteStyles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: Palette.RED,
    paddingHorizontal: 16,
    // marginRight: -64
  },
});

export const FriendLine = ({ contact }: { contact: ContactModel }) => {
  const { deleteFriend } = useContacts();
  const { getLatestCheckInForContact } = useCheckIns();
  const setContactToCheckin = useSetContactToCheckin();
  const { openContactModal } = useNewFriendProvider();

  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [isBirthday, setIsBirthday] = useState<boolean>(false);

  // Check if today is the contact's birthday - use useCallback and memoize values
  const checkIfBirthday = useCallback(() => {
    if (contact?.birthDate) {
      const today = new Date();
      const birthDate = contact.birthDate;

      // Compare month and day only, not the year or time
      const isTodayBirthday =
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth();

      setIsBirthday(isTodayBirthday);
    } else {
      setIsBirthday(false);
    }
  }, [contact?.birthDate]); // Only depend on birthDate, not the entire contact object

  // Run whenever the birthDate changes, not the entire contact object
  useEffect(() => {
    checkIfBirthday();
  }, [checkIfBirthday]);

  useEffect(() => {
    if (!contact.id) {
      return;
    }
    setLastCheckedIn(getLatestCheckInForContact(contact.id));
  }, [contact.id, reload, getLatestCheckInForContact]);

  const removeFriend = () => {
    if (!contact.id) {
      alert("Unable to delete friend without id");
      return;
    }
    deleteFriend(contact.id).then(() => {
      setReload((prev) => !prev);
    });
  };

  const checkInOnFriend = () => {
    if (!contact.id) {
      alert("Unable to check in on friend without id");
      return;
    }
    setContactToCheckin(contact);
  };

  const hasAlreadyCheckedIn = !!lastCheckedIn;

  const toDaysAgo = hasAlreadyCheckedIn
    ? Math.round(
        (new Date().getTime() - lastCheckedIn?.getTime()) / (1000 * 3600 * 24),
      )
    : null;
  const hasCheckedInToday = hasAlreadyCheckedIn && toDaysAgo! < 1;

  const openContactDetails = () => {
    // Instead of directly setting the contact, use the openContactModal function
    // which ensures a clean slate each time
    openContactModal(contact);
  };

  return (
    <Swipeable
      friction={2}
      overshootRight={false}
      renderRightActions={(progress, drag) => (
        <RightAction drag={drag} progress={progress} onPress={removeFriend} />
      )}
    >
      <View style={{ backgroundColor: "transparent" }}>
        <View style={[styles.friendContainer]}>
          <View style={styles.friendNameContainer}>
            <Pressable
              onPress={openContactDetails}
              accessibilityLabel={`Edit ${contact.firstName}'s details`}
              testID="edit-contact-avatar"
            >
              {contact.image ? (
                <Image source={contact.image} style={styles.friendImage} />
              ) : (
                <InitialImage
                  firstName={contact.firstName}
                  lastName={contact.lastName}
                  size={50}
                />
              )}
            </Pressable>
            <View>
              <ThemedText style={{ fontWeight: 600 }}>
                {contact.firstName}
                {isBirthday && " 🎂"}
              </ThemedText>
              {hasAlreadyCheckedIn ? (
                <ThemedText type="footNote">
                  {hasCheckedInToday
                    ? "Checked in today"
                    : `Checked in ${toDaysAgo} days ago`}
                </ThemedText>
              ) : (
                <ThemedText type="footNote">Never checked in yet !</ThemedText>
              )}
            </View>
          </View>
          {isBirthday ? (
            <PrimaryButton title="Send wishes" onPress={checkInOnFriend} />
          ) : (
            <PrimaryButton
              title={hasCheckedInToday ? "Come later" : "Check In"}
              onPress={checkInOnFriend}
            />
          )}
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  friendNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  friendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  birthdayBanner: {
    backgroundColor: "#FFF5EA",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  birthdayGift: {
    fontSize: 24,
    marginRight: 12,
  },
  birthdayTextContainer: {
    flex: 1,
  },
  birthdayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  birthdaySubtext: {
    fontSize: 14,
    color: "#666",
  },
});
