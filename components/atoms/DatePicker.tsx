import { ThemedText } from "@/components/atoms/ThemedText";
import { DateUtils } from "@/constants/DateUtils";
import { Colors, Spacing } from "@/constants/design";
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
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

type DatePickerProps = {
  value: Date | null;
  minuteInterval?: MinuteInterval;
  showIcon?: boolean;
} & Omit<
  IOSNativeProps | AndroidNativeProps | WindowsNativeProps,
  "value" | "display" | "minuteInterval"
>;

export const DatePicker = ({
  value,
  onChange,
  showIcon,
  ...rest
}: DatePickerProps) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(value);
  const shouldShowIcon = showIcon !== undefined && showIcon !== false;

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setTempDate(selectedDate || null);
  };

  const handleClose = () => {
    if (onChange && tempDate) {
      const event: DateTimePickerEvent = {
        type: "set",
        nativeEvent: {
          timestamp: tempDate.getTime(),
          utcOffset: 0,
        },
      };
      onChange(event);
    }
    setShow(false);
  };

  const handleOpen = () => {
    setTempDate(value);
    setShow(true);
  };

  const theme = useColorSchemeOrDefault();

  const styles = makeStyles(theme);

  return (
    <View>
      <Pressable onPress={handleOpen}>
        {value ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <ThemedText>{DateUtils.displayDateAsDDMMYYYY(value)}</ThemedText>
            {shouldShowIcon ? (
              <SymbolView
                size={16}
                tintColor={Colors[theme].icon}
                name="chevron.down"
              />
            ) : null}
          </View>
        ) : (
          <ThemedText>Pick a date</ThemedText>
        )}
      </Pressable>

      <Modal
        visible={show}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalContainer} onPress={handleClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={tempDate || new Date()}
              mode="date"
              onChange={handleChange}
              maximumDate={new Date()}
              display="inline"
              style={styles.datePicker}
              themeVariant={theme === "dark" ? "dark" : "light"}
              accentColor={Colors[theme].tint}
              textColor={Colors[theme].text}
              {...rest}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      backgroundColor: Colors[theme].plainBackground,
      borderRadius: 16,
      overflow: "hidden",
      paddingBottom: Spacing.medium,
      paddingHorizontal: Spacing.medium,
    },
    datePicker: {
      width: "100%",
      height: 350,
    },
  });
