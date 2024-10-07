import { Contact, presentFormAsync } from "expo-contacts";
import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, Image, View, Text, useColorScheme, Pressable } from "react-native";
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import * as Linking from 'expo-linking';
import { ReminderFrequency } from "@/app/repositories/contacts/ReminderFrequency";

type NewFriendSettingsProps = {
  contact: Contact | null;
  frequency: ReminderFrequency;
  setFrequency: Dispatch<SetStateAction<ReminderFrequency>>
};

export const NewFriendSettings = ({ contact,frequency, setFrequency}: NewFriendSettingsProps) => {
  const theme = useColorScheme() ?? 'light';

  if (!contact) {
    return null;
  }

  const styles = makeStyles(theme);

  const contactBirthday = contact.birthday ? `${contact.birthday?.day}/${contact.birthday.month}/${contact.birthday.year}` : "-";

  const reminderFrequencyOptions: ReminderFrequency[] = [
    "weekly",
    "monthly",
    "yearly",
  ];
  const handleFrequencyChange = (itemValue: ItemValue) => {
    setFrequency(itemValue as ReminderFrequency);
  };

  const callContact = async () => {
    const phoneNumber = contact.phoneNumbers?.at(0)?.number;
    if (!phoneNumber) {
      alert("No phone number available");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
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
      console.error(error);
      alert("An error occured");
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.contactInfo}>
          <Image
            style={styles.image}
            source={{ uri: "https://picsum.photos/200/300" }}
          />
          <Text style={styles.name}>{contact.firstName} {contact.lastName}</Text>
        </View>
        <View style={styles.actions}>
          {/* Button with icon */}
          <Pressable style={styles.button} onPress={sendSms}>
            <Feather style={styles.actionIcon} name="message-circle" />
            <Text style={styles.buttonText}>Message</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={callContact}>
            <FontAwesome style={styles.actionIcon} name="phone" />
            <Text style={styles.buttonText}>Call</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={seeContact}>
            <Ionicons name="person" style={styles.actionIcon} />
            <Text style={styles.buttonText}>Contact</Text>
          </Pressable>
        </View>
        <View style={styles.complementaryInfos}>
          <View style={styles.complementaryInfo}>
            <View style={styles.complementaryInfoTitleContainer}>
              <Ionicons size={20} color={Colors[theme].icon} name="gift" />
              <Text style={styles.complementaryInfoTitle}>Birthdate :</Text>
            </View>
            <Text style={styles.complementaryInfoTitle}>{contactBirthday}</Text>
          </View>
          <View style={styles.complementaryInfo}>
            <View style={styles.complementaryInfoTitleContainer}>
              <AntDesign size={20} color={Colors[theme].icon} name="calendar" />
              <Text style={styles.complementaryInfoTitle}>Last check in :</Text>
            </View>
            <Text style={styles.complementaryInfoTitle}>Never</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', gap: 20, marginTop: 20, marginBottom: -40, justifyContent: 'center', alignItems: 'center', maxHeight: 100}}>
          <Feather size={20} color={Colors[theme].icon} name="refresh-ccw" />
          <Text style={styles.complementaryInfoTitle}>Frequency :</Text>
        <Picker
          selectedValue={frequency}
          mode="dropdown"
          onValueChange={handleFrequencyChange}
          style={{ width: 150, height: 150, color: Colors[theme].icon, overflow: 'hidden' }} itemStyle={{color: Colors[theme].icon}}
        >
            {reminderFrequencyOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
            ))}
        </Picker>
        </View>
      </View>
  );
};

const makeStyles = (color: 'light' | 'dark') => StyleSheet.create({
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
    gap: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors[color].text
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    padding: 10,
    width: 100,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gray",
    borderRadius: 10,
    flexDirection: "column",
    opacity: 0.7,
    gap: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "semibold",
  },
  actionIcon: {
    fontSize: 28,
    color: "white",
  },
  complementaryInfo: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  complementaryInfoTitle: {
    fontSize: 20,
    fontWeight: "heavy",
    color: Colors[color].text
  },
  complementaryInfos: {
    paddingTop: 10,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    color: Colors[color].text
  },
  complementaryInfoTitleContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
