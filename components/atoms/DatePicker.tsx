import { ThemedText } from "@/components/atoms/ThemedText";
import { Colors } from "@/constants/design";
import {
  ColorSchemeName,
  useColorSchemeOrDefault,
} from "@/hooks/useColorScheme";
import DateTimePicker, {
  AndroidNativeProps,
  DateTimePickerEvent,
  IOSNativeProps,
  WindowsNativeProps,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

type DatePickerProps = {
  value: Date | null;
  minuteInterval?: MinuteInterval;
} & Omit<
  IOSNativeProps | AndroidNativeProps | WindowsNativeProps,
  "value" | "display" | "minuteInterval"
>;

export const DatePicker = ({ value, onChange, ...rest }: DatePickerProps) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (onChange) {
      onChange(event);
    }
  };

  const styles = makeStyles(useColorSchemeOrDefault());

  return (
    <View>
      <Pressable onPress={() => setShow(true)}>
        <ThemedText>
          {value ? new Date(value).toDateString() : "Pick a date"}
        </ThemedText>
      </Pressable>

      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShow(false)}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Pressable onPress={() => setShow(false)}>
                <ThemedText>Done</ThemedText>
              </Pressable>
            </View>
            <DateTimePicker
              testID="dateTimePicker"
              value={value || new Date()}
              mode="date"
              onChange={handleChange}
              maximumDate={new Date()}
              display="inline"
              style={{ width: "100%", height: "100%" }}
              {...rest}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: Colors[theme].background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      width: "100%",
      alignItems: "center",
      marginBottom: 16,
    },
  });
