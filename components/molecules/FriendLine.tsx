import { PrimaryButton } from "@/components";
import { Palette } from "@/constants/design";
import { useCheckIns } from "@/contexts/CheckIns.context";
import { useContacts } from "@/contexts/Contact.context";
import { ContactModel } from "@/repositories";
import { useSetContactToCheckin } from "@/store/CheckinNote.store";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
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

  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
  const [reload, setReload] = useState<boolean>(false);
  const setContactToCheckin = useSetContactToCheckin();

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

  return (
    <Swipeable
      friction={2}
      overshootRight={false}
      renderRightActions={(progress, drag) => (
        <RightAction drag={drag} progress={progress} onPress={removeFriend} />
      )}
    >
      <View style={[styles.friendContainer]}>
        <View style={styles.friendNameContainer}>
          {contact.image ? (
            <Image source={contact.image} style={styles.friendImage} />
          ) : (
            <InitialImage
              firstName={contact.firstName}
              lastName={contact.lastName}
              size={50}
            />
          )}
          <View>
            <ThemedText type="text" style={{ fontWeight: "600" }}>
              {contact.firstName}
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
        <PrimaryButton
          title={hasCheckedInToday ? "Come later" : "Check In"}
          onPress={checkInOnFriend}
        />
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
});
