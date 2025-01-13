import { BorderRadius } from "@/constants/design";
import { Colors } from "@/constants/design/Colors";
import {
  ColorSchemeName,
  useColorSchemeOrDefault,
} from "@/hooks/useColorScheme";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface DropdownOption<T> {
  label: string;
  value: T;
}

interface SelectDropdownProps<T> {
  options: DropdownOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
}

export const SelectDropdown = <T extends unknown>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: SelectDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [measurements, setMeasurements] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);
  const theme = useColorSchemeOrDefault();
  const styles = makeStyles(theme);

  const handleOpen = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMeasurements({
        x: pageX,
        y: pageY,
        width,
        height,
      });
      setIsOpen(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    });
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  };

  const handleSelect = (selectedValue: T) => {
    onChange(selectedValue);
    handleClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.trigger, isOpen && { opacity: 0 }]}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.triggerText}>
            {selectedOption?.label || placeholder}
          </ThemedText>
          <SymbolView
            name="chevron.up.chevron.down"
            size={20}
            tintColor={Colors[theme].text}
          />
        </TouchableOpacity>
      </View>

      <Modal visible={isOpen} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                position: "absolute",
                top: measurements.y - 350,
                left: measurements.x - 75,
                width: measurements.width + 75,
                transform: [{ translateY }],
                opacity,
                zIndex: 1000,
              },
            ]}
          >
            <View>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.option,
                    index === options.length - 1 && styles.lastOption,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <ThemedText>{option.label}</ThemedText>
                  {value === option.value && (
                    <SymbolView
                      name="checkmark"
                      size={20}
                      tintColor={Colors[theme].text}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const makeStyles = (theme: ColorSchemeName) =>
  StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors[theme].toastBackground,
    },
    triggerText: {
      fontSize: 16,
      marginRight: 16,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    dropdown: {
      backgroundColor: Colors[theme].toastBackground,
      borderRadius: BorderRadius.mediumLarge,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      overflow: "hidden",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: "transparent",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "black",
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    optionText: {
      fontSize: 16,
      color: Colors[theme].text,
    },
  });
