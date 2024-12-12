import DateTimePicker, {
    AndroidNativeProps, DateTimePickerEvent,
    IOSNativeProps,
    WindowsNativeProps
} from "@react-native-community/datetimepicker";
import {ThemedText} from "@/components/atoms/ThemedText";
import {Modal, Pressable, View} from "react-native";
import {useRef, useState} from "react";
import {Colors} from "@/constants/design";

type DatePickerProps = {
    value: Date | null;
} & Omit<IOSNativeProps | AndroidNativeProps | WindowsNativeProps, "value" | "display">;

export const DatePicker = ({value, onChange, ...rest}: DatePickerProps) => {
    const [show, setShow] = useState(false);

    const setTodayDate = () => {
        if (onChange) {
            onChange({
                nativeEvent: {
                    timestamp: Date.now(),
                }
            } as DateTimePickerEvent);
        }
    }

    const forwardOnChangeAndClose = (event: DateTimePickerEvent) => {
        if (onChange) {
            onChange(event);
        }
        setShow(false);
    }

    return (
        <View>
            <Pressable
                onPress={() => setShow(true)}
            >
                <ThemedText>{value ? new Date(value).toDateString() : "Select Date"}</ThemedText>
            </Pressable>

            <Modal
                visible={show}
                animationType="slide"
                onRequestClose={() => setShow(false)}
            >
                <View>
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={value ? new Date(value) : new Date()}
                        onChange={forwardOnChangeAndClose}
                        display="inline"
                        maximumDate={new Date()}
                    />
                </View>
            </Modal>
        </View>
    );
}