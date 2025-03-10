import { PrimaryButton } from "@/components/atoms/PrimaryButton";
import { ThemedText } from "@/components/atoms/ThemedText";
import { InitialImage } from "@/components/molecules/InitialImage";
import { Palette } from "@/constants/design";
import { useCheckIns } from "@/contexts/CheckIns.context";
import { useNewFriendProvider } from "@/hooks/useNewFriendProvider";
import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { logService } from "@/services/log.service";
import { useSetContactToCheckin } from "@/store/CheckinNote.store";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

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
  const { getLatestCheckInForContact } = useCheckIns();
  const setContactToCheckin = useSetContactToCheckin();
  const { openContactModal } = useNewFriendProvider();

  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
  const [isBirthday, setIsBirthday] = useState<boolean>(false);

  // Check if today is the contact's birthday
  useEffect(() => {
    if (contact?.birthDate) {
      const today = new Date();
      const birthDate = contact.birthDate;

      // Compare month and day only
      const isTodayBirthday =
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth();

      setIsBirthday(isTodayBirthday);
    } else {
      setIsBirthday(false);
    }
  }, [contact?.birthDate]);

  // Fetch the last check-in date
  useEffect(() => {
    if (!contact.id) return;

    const fetchData = async () => {
      try {
        const lastCheckin = await getLatestCheckInForContact(contact.id || "");
        setLastCheckedIn(lastCheckin);
      } catch (error) {
        logService.error(`Error fetching last check-in:`, error);
      }
    };

    fetchData();
  }, [contact.id, getLatestCheckInForContact]);

  // Handler for removing a friend
  const removeFriend = useCallback(() => {
    if (!contact.id) return;

    alert(`Remove ${contact.firstName} from your friends?`);
    // Implementation of friend removal
  }, [contact]);

  // Handler for checking in on a friend
  const checkInOnFriend = useCallback(() => {
    if (contact.id) {
      setContactToCheckin(contact);
      // Navigate to check-in page
    }
  }, [contact, setContactToCheckin]);

  // Handler for sending birthday wishes
  const sendBirthdayWishes = useCallback(() => {
    alert(`Send birthday wishes to ${contact.firstName}`);
  }, [contact.firstName]);

  // Main handler for opening contact details
  const openContactDetails = useCallback(() => {
    openContactModal(contact);
  }, [contact, openContactModal]);

  // Calculate check-in status
  const hasCheckedInToday =
    lastCheckedIn &&
    new Date(lastCheckedIn).getDate() === new Date().getDate() &&
    new Date(lastCheckedIn).getMonth() === new Date().getMonth();

  const hasAlreadyCheckedIn = lastCheckedIn !== null;

  const toDaysAgo =
    hasAlreadyCheckedIn && lastCheckedIn
      ? Math.floor(
          (new Date().getTime() - new Date(lastCheckedIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  return (
    <Swipeable
      friction={2}
      overshootRight={false}
      renderRightActions={(progress, drag) => (
        <RightAction drag={drag} progress={progress} onPress={removeFriend} />
      )}
    >
      <Pressable
        style={({ pressed }) => [
          styles.friendContainer,
          pressed && styles.containerPressed,
        ]}
        onPress={openContactDetails}
        android_ripple={{
          color: "rgba(0, 0, 0, 0.05)",
          borderless: false,
        }}
      >
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
            <ThemedText style={styles.friendName}>
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
          <PrimaryButton title="Send wishes" onPress={sendBirthdayWishes} />
        ) : (
          <PrimaryButton
            title={hasCheckedInToday ? "Checked" : "Check In"}
            onPress={checkInOnFriend}
          />
        )}
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  containerPressed: {
    opacity: 0.95, // Slight opacity change
    transform: [{ scale: 0.985 }],
    // Add temporary elevation on press for depth effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  friendNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
