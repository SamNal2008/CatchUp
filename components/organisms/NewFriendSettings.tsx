import { DatePicker } from "@/components/atoms/DatePicker";
import { InitialImage } from "@/components/molecules/InitialImage";
import { Colors } from "@/constants/design/Colors";
import { useColorSchemeOrDefault } from "@/hooks/useColorScheme";

import { SelectDropdown } from "@/components/atoms/SelectDropdown";
import { ThemedText } from "@/components/atoms/ThemedText";
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

  const updateContactBirthday = (event: DateTimePickerEvent) => {
    setContactBirthday(new Date(event.nativeEvent.timestamp));
  };

  const updateContactLastCheckIn = (event: DateTimePickerEvent) => {
    setContactLastCheckIn(new Date(event.nativeEvent.timestamp));
  };

  return (
    <View style={styles.container}>
      <View style={styles.contactInfo}>
        <View style={{ width: 100, height: 100 }}>
          {contact.image?.uri ? (
            <Image style={styles.image} source={{ uri: contact.image?.uri }} />
          ) : (
            <InitialImage
              firstName={contact.firstName}
              lastName={contact.lastName}
              size={100}
            />
          )}
        </View>
        <Text style={styles.name}>
          {contact.firstName} {contact.lastName}
        </Text>
      </View>
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
            <Text style={styles.complementaryInfoTitle}>Birthday :</Text>
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
            <Text style={styles.complementaryInfoTitle}>Last check in :</Text>
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
            <Text style={styles.complementaryInfoTitle}>Frequency :</Text>
          </View>
          <SelectDropdown<ReminderFrequency>
            onChange={setSelectedFrequency}
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
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 15,
    },
    contactInfo: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    },
    name: {
      fontSize: 20,
      marginBottom: 20,
      color: Colors[color].text,
      fontWeight: "bold",
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 100,
    },
    actions: {
      flexDirection: "row",
      gap: 30,
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
      paddingVertical: 12,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[color].background,
      borderRadius: 16,
      flexDirection: "column",
      opacity: 0.7,
      gap: 5,
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: 0,
    },
    actionIcon: {
      width: 25,
      height: 25,
      margin: 5,
      color: Colors[color].text,
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
  });
