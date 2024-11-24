import { ThemedText } from "@/components/atoms/ThemedText";
import { ThemedView } from "@/components/atoms/ThemedView";
import { FriendLine } from "@/components/molecules/FriendLine";
import { useContacts } from "@/contexts/Contact.context";
import { ContactModel, ReminderFrequency, ReminderFrequencyUtils } from "@/repositories";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  section: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  additionalButton: {
    padding: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A898E'
  }
});

type SectionProps = {
  title: string;
  contacts: ContactModel[];
}

const Section = ({ contacts, title }: SectionProps) => {
  return contacts.length > 0 ? (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {contacts.map(contact => <FriendLine key={contact.id} contact={contact} />)}
    </View>
  ) : null;
}

export default function Profile() {
  const { friends } = useContacts();

  const friendsByFrequency = friends.reduce((acc, contact) => {
    if (!acc[contact.frequency]) {
      acc[contact.frequency] = [];
    }
    acc[contact.frequency].push(contact);
    return acc;
  }, {} as Record<ReminderFrequency, ContactModel[]>);

  return (
    <ThemedView>
        {friends.length === 0 ?
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 15, width: '100%' }}>
            <>
              <ThemedText type={"subtitle"}>
                Keep your closest within reach
              </ThemedText>
              <ThemedText type={"default"} style={{textAlign: "center"}}>
                Add friends to stay in touch, share memories, and never miss a
                birthday
              </ThemedText>
            </>
          </View>
          :
          <View style={{ flex: 1, gap: 30, width: '100%' }}>
            <FlatList
              data={Object.keys(friendsByFrequency)}
              renderItem={({item}) => <Section title={ReminderFrequencyUtils.translateFrequencyToEnglishOptions(item as ReminderFrequency)} contacts={friendsByFrequency[item as ReminderFrequency]}/>}
              keyExtractor={(item) => item}
            />
          </View>
        }
    </ThemedView>
  );
}

