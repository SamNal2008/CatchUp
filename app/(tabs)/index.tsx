import { StyleSheet, View, Button } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NewFriendSettings } from "@/components/NewFriendSettings";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useContacts } from "@/contexts/Contact.context";
import { ReminderFrequency } from "../repositories/contacts/ReminderFrequency";
import { createNewContactEntity } from "../repositories/contacts/ContactEntity";

export default function HomeScreen() {
  const { newContact, addNewFriend } = useContacts();
  const iconColor = useThemeColor("icon");
  const backgroundColor = useThemeColor("background");
  const [selectedFrequency, setSelectedFrequency] =
    useState<ReminderFrequency>("weekly");

  // variables
  const snapPoints = useMemo(() => ["80%", "100%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  useEffect(() => {
    if (newContact) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [newContact]);

  const saveNewFriend = async () => {
    console.debug(
      "saving new friend : " +
        newContact +
        " with frequency " +
        selectedFrequency
    );
    await addNewFriend(createNewContactEntity(newContact, selectedFrequency));
    bottomSheetRef.current?.close();
  };

  return (
    <ThemedView>
      <GestureHandlerRootView>
        <View style={[styles.container]}>
          <ThemedText type={"subtitle"}>
            Keep your closest within reach
          </ThemedText>
          <ThemedText type={"default"}>
            Add friends to stay in touch, share memories, and never miss a
            birthday
          </ThemedText>
        </View>
        <BottomSheetModalProvider>
          <BottomSheet
            ref={bottomSheetRef}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            style={[
              {
                backgroundColor,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            ]}
            handleIndicatorStyle={{ backgroundColor: iconColor }}
            backgroundStyle={{ backgroundColor }}
            index={-1}
          >
            <BottomSheetView style={styles.contentContainer}>
              <View style={styles.bottomSheetHeader}>
                <Button title="Close" onPress={closeSheet} />
                <Button title="Save" onPress={saveNewFriend} />
              </View>
              <NewFriendSettings
                frequency={selectedFrequency}
                setFrequency={setSelectedFrequency}
                contact={newContact}
              />
            </BottomSheetView>
          </BottomSheet>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
