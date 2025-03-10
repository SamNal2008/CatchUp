import { Colors } from "@/constants/design";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";
import { ReminderFrequency } from "@/repositories/contacts/ReminderFrequency";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ReminderFrequencyOption = {
  value: ReminderFrequency;
  label: string;
  description?: string;
};

const reminderOptions: ReminderFrequencyOption[] = [
  { value: "daily", label: "Daily", description: "Every day" },
  { value: "weekly", label: "Weekly", description: "Once a week" },
  { value: "bimonthly", label: "Bi-Weekly", description: "Every 2 weeks" },
  { value: "monthly", label: "Monthly", description: "Once a month" },
  { value: "quarterly", label: "Quarterly", description: "Every 3 months" },
  { value: "biannually", label: "Half-Yearly", description: "Every 6 months" },
  { value: "yearly", label: "Yearly", description: "Once a year" },
  { value: "never", label: "Never", description: "No reminders" },
];

interface ReminderFrequencySelectorProps {
  selectedFrequency: ReminderFrequency;
  onChange: (frequency: ReminderFrequency) => void;
}

export const ReminderFrequencySelector: React.FC<
  ReminderFrequencySelectorProps
> = ({ selectedFrequency, onChange }) => {
  const theme = useColorSchemeOrDefault();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      {reminderOptions.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.option,
            selectedFrequency === option.value && styles.selectedOption,
            { backgroundColor: Colors[theme].background },
          ]}
          onPress={() => onChange(option.value)}
        >
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                { color: Colors[theme].text },
                selectedFrequency === option.value && styles.selectedLabel,
              ]}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text
                style={[
                  styles.description,
                  { color: Colors[theme].tabIconDefault },
                ]}
              >
                {option.description}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.radio,
              selectedFrequency === option.value && styles.radioSelected,
              { borderColor: Colors[theme].tint },
            ]}
          >
            {selectedFrequency === option.value && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: Colors[theme].tint },
                ]}
              />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const makeStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      borderRadius: 8,
      overflow: "hidden",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5E5",
    },
    selectedOption: {
      backgroundColor: `${Colors[theme].tint}10`, // 10% opacity of tint color
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
    },
    selectedLabel: {
      fontWeight: "700",
    },
    description: {
      fontSize: 14,
      marginTop: 2,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      borderWidth: 2,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  });
