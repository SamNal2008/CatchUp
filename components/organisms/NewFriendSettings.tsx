import { DatePicker } from "@/components/atoms/DatePicker";
import { ThemedText } from "@/components/atoms/ThemedText";
import { InitialImage } from "@/components/molecules/InitialImage";
import { Colors } from "@/constants/design/Colors";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";

import { SelectDropdown } from "@/components/atoms/SelectDropdown";
import {
  ReminderFrequency,
  reminderFrequencyOptionsWithTranslation,
} from "@/repositories/contacts/ReminderFrequency";
import { logService } from "@/services/log.service";
import { useNewFriendStore } from "@/store/NewFriend.store";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { presentFormAsync } from "expo-contacts";
import * as Linking from "expo-linking";
import * as SMS from "expo-sms";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export const NewFriendSettings = () => {
  const theme = useColorSchemeOrDefault();
  const {
    contact,
    selectedFrequency,
    setSelectedFrequency,
    setContactBirthday,
    contactBirthday,
    setContactLastCheckIn,
    contactLastCheckIn,
  } = useNewFriendStore();

  // Determine if this is an existing contact
  const [isBirthday, setIsBirthday] = useState<boolean>(false);

  // Check if today is the contact's birthday
  const checkIfBirthday = useCallback(() => {
    if (!contactBirthday) {
      setIsBirthday(false);
      return;
    }

    const today = new Date();
    const isTodayBirthday =
      today.getDate() === contactBirthday.getDate() &&
      today.getMonth() === contactBirthday.getMonth();

    setIsBirthday(isTodayBirthday);
  }, [contactBirthday]);

  // Run whenever the contact or its birthday changes
  useEffect(() => {
    checkIfBirthday();
  }, [checkIfBirthday, contactBirthday]);

  // If no contact is set, render nothing - the modal will be closed anyway
  if (!contact) {
    return null;
  }

  const styles = makeStyles(theme);

  const callContact = async () => {
    const phoneNumber = contact.phoneNumbers?.at(0)?.number;
    if (!phoneNumber) {
      alert("No phone number available");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(logService.error);
  };

  const seeContact = async () => {
    const contactId = contact.id;
    if (!contactId) {
      alert("No phone number available");
      return;
    }

    // Present the contact form
    await presentFormAsync(contactId);
  };

  const sendSms = async () => {
    const phoneNumber = contact.phoneNumbers?.at(0)?.number;
    if (!phoneNumber) {
      alert("No phone number available");
      return;
    }
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(phoneNumber, "Hola from Catchup");
      } else {
        alert("SMS is not available on this device");
      }
    } catch (error) {
      logService.error(error);
      alert("An error occured");
    }
  };

  // Update handlers - local state only
  const updateContactBirthday = async (event: DateTimePickerEvent) => {
    if (event.type === "set" && event.nativeEvent.timestamp) {
      setContactBirthday(new Date(event.nativeEvent.timestamp));
    }
  };

  const updateContactLastCheckIn = async (event: DateTimePickerEvent) => {
    if (event.type === "set" && event.nativeEvent.timestamp) {
      setContactLastCheckIn(new Date(event.nativeEvent.timestamp));
    }
  };

  const updateContactFrequency = (newFrequency: ReminderFrequency) => {
    setSelectedFrequency(newFrequency);
  };

  return (
    <View style={styles.container}>
      {/* Contact Info */}
      <View style={styles.contactInfo}>
        {contact.image?.uri ? (
          <Image
            source={{ uri: contact.image?.uri }}
            style={styles.contactImage}
          />
        ) : (
          <InitialImage
            firstName={contact.firstName}
            lastName={contact.lastName}
            size={80}
          />
        )}
        <View style={styles.contactDetails}>
          <ThemedText type="title3">
            {contact.firstName} {contact.lastName}
            {isBirthday && " 🎂"}
          </ThemedText>
        </View>
      </View>

      {/* Birthday Banner */}
      {isBirthday && (
        <View style={styles.birthdayBanner}>
          <Text style={styles.birthdayGift}>🎁</Text>
          <View style={styles.birthdayTextContainer}>
            <Text style={styles.birthdayText}>
              It's {contact.firstName}'s birthday today! 🎉
            </Text>
            <Text style={styles.birthdaySubtext}>
              Don't forget to send birthday wishes!
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {/* Button with icon */}
        <Pressable style={styles.button} onPress={sendSms}>
          <SymbolView
            name="message.fill"
            style={styles.actionIcon}
            tintColor={Colors[theme].tint}
          />
          <ThemedText type="defaultSemiBold">Message</ThemedText>
        </Pressable>
        <Pressable style={styles.button} onPress={callContact}>
          <SymbolView
            name="phone.fill"
            style={styles.actionIcon}
            tintColor={Colors[theme].tint}
          />
          <ThemedText type="defaultSemiBold">Call</ThemedText>
        </Pressable>
        <Pressable style={styles.button} onPress={seeContact}>
          <SymbolView
            name="person.fill"
            style={styles.actionIcon}
            tintColor={Colors[theme].tint}
          />
          <ThemedText type="defaultSemiBold">Contact</ThemedText>
        </Pressable>
      </View>
      <View style={styles.complementaryInfos}>
        <View style={styles.complementaryInfo}>
          <View style={styles.complementaryInfoTitleContainer}>
            <SymbolView
              size={20}
              tintColor={Colors[theme].icon}
              name="gift.fill"
            />
            <ThemedText type="text">Birthday :</ThemedText>
          </View>
          <DatePicker
            value={contactBirthday}
            onChange={updateContactBirthday}
            maximumDate={new Date()}
          />
        </View>
        <View style={styles.complementaryInfo}>
          <View style={styles.complementaryInfoTitleContainer}>
            <SymbolView
              size={20}
              tintColor={Colors[theme].icon}
              name="calendar"
            />
            <ThemedText type="text">Last check in :</ThemedText>
          </View>
          <DatePicker
            value={contactLastCheckIn}
            onChange={updateContactLastCheckIn}
            maximumDate={new Date()}
          />
        </View>
        <View style={styles.complementaryInfo}>
          <View style={styles.complementaryInfoTitleContainer}>
            <SymbolView
              size={20}
              tintColor={Colors[theme].icon}
              name="arrow.circlepath"
            />
            <ThemedText type="text">Frequency :</ThemedText>
          </View>
          <SelectDropdown<ReminderFrequency>
            onChange={updateContactFrequency}
            options={reminderFrequencyOptionsWithTranslation}
            value={selectedFrequency}
            key={"key"}
            placeholder="Select an option"
          />
        </View>
      </View>
    </View>
  );
};

const makeStyles = (color: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      gap: 15,
    },
    header: {
      width: "100%",
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[color].text,
    },
    contactInfo: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingBottom: 16,
    },
    contactImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
    },
    contactDetails: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    contactName: {
      fontSize: 20,
      marginBottom: 20,
      color: Colors[color].text,
      fontWeight: "bold",
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 20,
    },
    pickerContainer: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    picker: {
      backgroundColor: "white",
      marginHorizontal: 20,
      borderRadius: 10,
      padding: 20,
    },
    closeButton: {
      marginTop: 10,
      alignItems: "center",
    },
    closeButtonText: {
      color: "#007AFF",
      fontSize: 16,
    },
    button: {
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      backgroundColor: Colors[color].background,
      borderRadius: 8,
      width: "30%",
    },
    actionIcon: {
      marginBottom: 8,
    },
    complementaryInfo: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 20,
    },
    complementaryInfoTitle: {
      fontSize: 20,
      fontWeight: "heavy",
      color: Colors[color].text,
    },
    complementaryInfos: {
      paddingTop: 10,
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 15,
      color: Colors[color].text,
    },
    complementaryInfoTitleContainer: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      flex: 1,
    },
    birthdayBanner: {
      backgroundColor: "#FFF5EA",
      borderRadius: 8,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
      alignSelf: "center",
      width: "90%",
      gap: 4,
    },
    birthdayGift: {
      fontSize: 24,
      marginRight: 12,
    },
    birthdayTextContainer: {
      flex: 1,
    },
    birthdayText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#000",
    },
    birthdaySubtext: {
      fontSize: 14,
      color: "#666",
    },
  });
