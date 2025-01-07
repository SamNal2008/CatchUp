import { ThemedText } from "@/components/atoms/ThemedText";
import { Colors } from "@/constants/design";
import {
  AndroidNativeProps,
  DateTimePickerEvent,
  IOSNativeProps,
  WindowsNativeProps,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, View } from "react-native";

type DatePickerProps = {
  value: Date | null;
} & Omit<
  IOSNativeProps | AndroidNativeProps | WindowsNativeProps,
  "value" | "display"
>;

export const DatePicker = ({ value, onChange, ...rest }: DatePickerProps) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(false);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <View>
      <Pressable onPress={() => setShow(true)}>
        <ThemedText style={{ color: value ? undefined : Colors.gray }}>
          {value ? new Date(value).toDateString() : "Pick a date"}
        </ThemedText>
      </Pressable>
    </View>
  );
};
