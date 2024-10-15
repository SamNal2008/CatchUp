import { Contact, presentFormAsync } from "expo-contacts";
import { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, Image, View, Text, useColorScheme, Pressable } from "react-native";
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/design/Colors";
import * as Linking from 'expo-linking';
import { ReminderFrequency } from "@/repositories/contacts/ReminderFrequency";
import { SymbolView } from 'expo-symbols';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateUtils } from "@/constants/DateUtils";

type NewFriendSettingsProps = {
  contact: Contact | null;
  frequency: ReminderFrequency;
  setFrequency: Dispatch<SetStateAction<ReminderFrequency>>
};

export const NewFriendSettings = ({ contact ,frequency, setFrequency}: NewFriendSettingsProps) => {
  const theme = useColorScheme() ?? 'light';

  if (!contact) {
    return null;
  }

  const styles = makeStyles(theme);

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
            source={{ uri: contact.image?.uri }}
          />
          <Text style={styles.name}>{contact.firstName} {contact.lastName}</Text>
        </View>
        <View style={styles.actions}>
          {/* Button with icon */}
          <Pressable style={styles.button} onPress={sendSms}>
            <SymbolView name="message.fill" style={styles.actionIcon} tintColor={Colors.light.icon} />
            <Text style={styles.buttonText}>Message</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={callContact}>
            <SymbolView name="phone.fill" style={styles.actionIcon} tintColor={Colors.light.icon} />
            <Text style={styles.buttonText}>Call</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={seeContact}>
            <SymbolView name="person.fill" style={styles.actionIcon} tintColor={Colors.light.icon} />
            <Text style={styles.buttonText}>Contact</Text>
          </Pressable>
        </View>
        <View style={styles.complementaryInfos}>
          <View style={styles.complementaryInfo}>
            <View style={styles.complementaryInfoTitleContainer}>
              <Ionicons size={20} color={Colors[theme].icon} name="gift" />
              <Text style={styles.complementaryInfoTitle}>Birthday :</Text>
            </View>
            <DateTimePicker value={contact.birthday ? new Date(DateUtils.getDateFromContactDate(contact.birthday)) : new Date()} onChange={e => console.log(new Date(e.nativeEvent.timestamp))} />
          </View>
          <View style={styles.complementaryInfo}>
            <View style={styles.complementaryInfoTitleContainer}>
              <AntDesign size={20} color={Colors[theme].icon} name="calendar" />
              <Text style={styles.complementaryInfoTitle}>Last check in :</Text>
            </View>
            <DateTimePicker value={new Date()} onChange={e => console.log(new Date(e.nativeEvent.timestamp))} />
          </View>
          <View style={styles.complementaryInfo}>
            <View style={styles.complementaryInfoTitleContainer}>
              <Ionicons size={20} color={Colors[theme].icon} name="refresh-outline" />
              <Text style={styles.complementaryInfoTitle}>Frequency</Text>
            </View>
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
  },
  name: {
    fontSize: 20,
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
    gap: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F2F8",
    borderRadius: 16,
    flexDirection: "column",
    opacity: 0.7,
    gap: 5,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "semibold",
  },
  actionIcon: {
    width: 25,
    height: 25,
    margin: 5,
    color: Colors[color].background
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
