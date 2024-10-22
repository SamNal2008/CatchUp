import { NewFriendSettings } from "@/components/NewFriendSettings";
import { createNewContactEntity, ReminderFrequency } from "@/repositories";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useContacts } from "./Contact.context";
import { useThemeColor } from "@/hooks/useThemeColor";

interface BottomSheetContextProps {

};

const BottomSheetContext = createContext<BottomSheetContextProps | null>(null);

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) throw new Error('Context should be defined');
  return context;
}

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const snapPoints = useMemo(() => ["50%", "60%", "80%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { newContact, addNewFriend } = useContacts();

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const [selectedFrequency, setSelectedFrequency] = useState<ReminderFrequency>("weekly");

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

  const saveNewFriend = async () => {
    console.debug(
      "saving new friend : " +
      JSON.stringify(newContact, null, 2) +
      " with frequency " +
      selectedFrequency
    );
    await addNewFriend(createNewContactEntity(newContact, selectedFrequency));
    bottomSheetRef.current?.close();
  };

  const iconColor = useThemeColor("icon");
  const backgroundColor = useThemeColor("background");

  useEffect(() => {
    console.log("newContact : " + newContact);
    if (newContact) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [newContact]);

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <BottomSheetContext.Provider value={null}>
          {children}
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
                <Button title="Cancel" color={Colors.light.tint} onPress={closeSheet} />
                <Button title="Save" color={Colors.light.tint} onPress={saveNewFriend} />
              </View>
              <NewFriendSettings
                frequency={selectedFrequency}
                setFrequency={setSelectedFrequency}
                contact={newContact}
              />
            </BottomSheetView>
          </BottomSheet>
        </BottomSheetContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};


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