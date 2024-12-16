import { ThemedText } from "@/components/atoms/ThemedText";
import { ThemedView } from "@/components/atoms/ThemedView";
import { FriendLine } from "@/components/molecules/FriendLine";
import { useContacts } from "@/contexts/Contact.context";
import { ContactModel, ReminderFrequency, ReminderFrequencyUtils } from "@/repositories";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {Spacing} from "@/constants/design";
import {CheckInToast} from "@/components/organisms/CheckInToast";
import {PlaceholderScreen} from "@/components/molecules/PlaceholderScreen";

const styles = StyleSheet.create({
  section: {
    flexDirection: 'column',
    width: '100%',
  },
  additionalButton: {
    padding: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type SectionProps = {
  title: string;
  contacts: ContactModel[];
}

const Section = ({ contacts, title }: SectionProps) => {
  return contacts.length > 0 ? (
    <View style={styles.section}>
      <ThemedText type={'sectionTitle'}>{title}</ThemedText>
      {contacts.map(contact => <FriendLine key={contact.id} contact={contact} />)}
    </View>
  ) : null;
}

export default function Friends() {
  const { friends } = useContacts();

  const friendsByFrequency = friends.reduce((acc, contact) => {
    if (!acc[contact.frequency]) {
      acc[contact.frequency] = [];
    }
    acc[contact.frequency].push(contact);
    return acc;
  }, {} as Record<ReminderFrequency, ContactModel[]>);

  return (
    <ThemedView style={{
      flex: 1,
      gap: 20,
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
      width: '100%'
    }}>
        {friends.length === 0 ? <PlaceholderScreen /> :
          <View style={{ flex: 1, gap: 30, width: '100%' }}>
            <FlatList
              data={Object.keys(friendsByFrequency)}
              renderItem={({item}) => <Section title={ReminderFrequencyUtils.translateFrequencyToEnglishOptions(item as ReminderFrequency)} contacts={friendsByFrequency[item as ReminderFrequency]}/>}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap : Spacing.medium }}
            />
            <CheckInToast />
          </View>
        }
    </ThemedView>
  );
}

