import { PrimaryButton } from "@/components/atoms/PrimaryButton";
import { SecondaryButton } from "@/components/atoms/SecondaryButton";
import { ThemedText } from "@/components/atoms/ThemedText";
import { Colors, Palette } from "@/constants/design";
import { TimeConstants } from "@/constants/Time";
import { useCheckIns } from "@/contexts/CheckIns.context";
import {
  ColorSchemeName,
  useColorSchemeOrDefault,
} from "@/hooks/useColorScheme";
import {
  useNewCheckinInfo,
  useNewNoteCheckInModalControl,
  useSetContactToCheckin,
} from "@/store/CheckinNote.store";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, useAnimatedValue, View } from "react-native";

export const CheckInToast = () => {
  const theme: ColorSchemeName = useColorSchemeOrDefault();
  const [userWantsToAddNote, setUserWantsToAddNote] = useState(false);
  const userWantsToAddNoteRef = useRef(userWantsToAddNote);
  const styles = makeStyles(theme);
  const { openModal, isModalVisible } = useNewNoteCheckInModalControl();
  const setContactToCheckin = useSetContactToCheckin();
  const { checkInOnContact } = useCheckIns();
  const fadeAnim = useAnimatedValue(1);
  const { contactToCheckin } = useNewCheckinInfo();

  const isVisible = contactToCheckin !== null;

  const addNote = () => {
    setUserWantsToAddNote(true);
    userWantsToAddNoteRef.current = true;
    openModal();
  };

  const undoContactCheckin = () => {
    setContactToCheckin(null);
  };

  useEffect(() => {
    if (!isModalVisible && userWantsToAddNoteRef.current) {
      userWantsToAddNoteRef.current = false;
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: TimeConstants.CONFIRM_CHECKIN_DELAY,
        useNativeDriver: true,
      }).start();
      const timeout = setTimeout(() => {
        if (!userWantsToAddNoteRef.current) {
          checkInOnContact();
        }
      }, TimeConstants.CONFIRM_CHECKIN_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, checkInOnContact, fadeAnim, userWantsToAddNoteRef]);

  return (
    <>
      {isVisible ? (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ color: Palette.GREY_300, fontSize: 13 }}
                type={"default"}
              >
                Checked in with
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                ellipsizeMode={"tail"}
                style={{ fontFamily: "SF Pro", fontSize: 16 }}
                type={"subtitle"}
              >
                {contactToCheckin.firstName} {contactToCheckin.lastName}
              </ThemedText>
            </View>
            <View style={{ flexDirection: "row", gap: 5, flex: 1 }}>
              <SecondaryButton title={"Undo"} onPress={undoContactCheckin} />
              <PrimaryButton title={"+ Note"} onPress={addNote} />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
};

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    toast: {
      backgroundColor: Colors[theme].toastBackground,
      borderRadius: 8,
      width: 360,
      height: 70,
      alignItems: "stretch",
      justifyContent: "center",
      position: "absolute",
      bottom: "5%",
      padding: 10,
    },
    container: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
  });
