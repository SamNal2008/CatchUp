import { ThemedView } from "@/components/ThemedView";
import { useContacts } from "@/contexts/Contact.context";
import { useCallback, useEffect, useState } from "react";
import { ContactModel } from "../repositories/contacts/ContactEntity";
import { View, Text, StyleSheet, Pressable, Alert, AlertType} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
  },
  section: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  buttonPressed: {
    backgroundColor: 'gray',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

type CheckInButtonProps = {
  onPress?: () => void;
}

const CheckInButton = ({onPress} :CheckInButtonProps) => {
  return (
    <Pressable style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]} onPress={onPress}>
      <Text style={styles.text}>Check In</Text>
    </Pressable>
  );
}


const AdditionalButtons = ({onPress} :CheckInButtonProps) => {
  return (
    <Pressable style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null, {backgroundColor: 'white'}]} onPress={onPress}>
      <Text style={styles.text}>❌</Text>
    </Pressable>
  );
}

const FriendLine = ({contact}: {contact: ContactModel}) => {
  const {deleteFriend} = useContacts();
  const [isOnDeleteMode, setIsOnDeleteMode] = useState<boolean>(false);
  const toggleDeleteFriend = () => {
    setIsOnDeleteMode((prev) => !prev);
  }

  const promptForFriendDeletion = () => {
    Alert.prompt('Are you sure you want to delete this friend ?', `To confirm enter : ${contact.firstName}`, confirmDelete);
  }

  const confirmDelete = (promptResponse: string) => {
    if (promptResponse.toLowerCase() === contact.firstName?.toLowerCase()) {
      removeFriend();
      return;
    }
    alert('Friend deletion cancelled');
  }

  const removeFriend = () => {
    if (!contact.id) {
      alert('Unable to delete friend without id');
      return;
    }
    deleteFriend(contact.id);
  }
  return (
      <Pressable onPointerLeave={toggleDeleteFriend} onLongPress={toggleDeleteFriend}>
        <View style={styles.friendContainer}>
          <View style={styles.friendNameContainer}>
            <FontAwesome6 size="24" name="face-smile-beam"/>
            <View>
              <Text style={styles.friendName}>{contact.firstName}</Text>
              <Text>Checked in today</Text>
            </View>
          </View>
          {isOnDeleteMode ? <AdditionalButtons onPress={promptForFriendDeletion}/> : <CheckInButton onPress={() => console.log('click')} />}
        </View>
      </Pressable>
  )
}

type SectionProps = {
  title: string;
  contacts: ContactModel[];
}

const Section = ({contacts, title}: SectionProps) => {
  return contacts.length > 0 ? (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {contacts.map(contact => <FriendLine key={contact.id} contact={contact} />)}
    </View>
  ) : null;
}

export default function Profile() {
  const [yearlyContacts, setYearlyContacts] = useState<ContactModel[]>([]);
  const [weeklyContacts, setWeeklyContacts] = useState<ContactModel[]>([]);
  const [monthlyContacts, setMonthlyContacts] = useState<ContactModel[]>([]);
  const { friends } = useContacts();

  const getAllFriends = useCallback(() => {
    const contacts = friends;
    setYearlyContacts(contacts.filter(contact => contact.frequency === 'yearly'));
    setWeeklyContacts(contacts.filter(contact => contact.frequency === 'weekly'));
    setMonthlyContacts(contacts.filter(contact => contact.frequency === 'monthly'));
  }, [friends]);

  useEffect(() => {
    getAllFriends();
  }, [friends]);

  return (
    <ThemedView>
      <View style={{flex: 1, width: '100%', gap: 30}}>
        {friends.length === 0 ? 
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, gap: 15}}>
          <ThemedText type={'subtitle'}>C'est vide ici 😭 !</ThemedText>
          <ThemedText type={'defaultSemiBold'}>Cliquer en haut à gauche pour catch'up ↗️ </ThemedText>
        </View>
        : 
        <View>
          <Section title='Weekly' contacts={weeklyContacts}/>
          <Section title="Monthly" contacts={monthlyContacts} />
          <Section title="Yearly" contacts={yearlyContacts} />
        </View>
      }
      </View>
    </ThemedView>
  );
}
