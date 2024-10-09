import { ThemedView } from "@/components/ThemedView";
import { useContacts } from "@/contexts/Contact.context";
import { useCallback, useEffect, useState } from "react";
import { ContactModel } from "../repositories/contacts/ContactEntity";
import { View, Text, StyleSheet, Pressable, Alert, AlertType, Button} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCheckIns } from "@/contexts/CheckIns.context";

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
  disabled?: boolean;
}

const CheckInButton = ({onPress, disabled} :CheckInButtonProps) => {
  const backgroundColor = useThemeColor('itemAction');
  const color = useThemeColor('itemBackground');
  return (
    <Pressable disabled={disabled} style={({pressed}) => [styles.button, pressed || disabled ? styles.buttonPressed : {backgroundColor}]} onPress={onPress}>
      {disabled ? <Text style={styles.text}>Come later</Text> : <Text style={[styles.text, {color}]}>Check In</Text>}
    </Pressable>
  );
}


const AdditionalButtons = ({onPress} :CheckInButtonProps) => {
  const backgroundColor = useThemeColor('background');
  return (
    <Pressable style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : {backgroundColor}]} onPress={onPress}>
      <Text style={styles.text}>❌</Text>
    </Pressable>
  );
}

const FriendLine = ({contact}: {contact: ContactModel}) => {
  const backgroundColor = useThemeColor('itemBackground');
  const borderColor = useThemeColor('borderColor');
  const {deleteFriend} = useContacts();
  const {checkInsRepository} = useCheckIns();
  const [isOnDeleteMode, setIsOnDeleteMode] = useState<boolean>(false);
  const toggleDeleteFriend = () => {
    setIsOnDeleteMode((prev) => !prev);
  }

  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    setLastCheckedIn(checkInsRepository.getLatestCheckInForContact(contact.id));
  }, [contact.id, reload]);

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

  const checkInOnFriend = () => {
    if (!contact.id) {
      alert('Unable to check in on friend without id');
      return;
    }
    checkInsRepository.checkInOnContact(contact.id);
    setReload(prev => !prev);
  }

  const hasAlreadyCheckedIn = lastCheckedIn !== null;
  const toDaysAgo = hasAlreadyCheckedIn ? Math.round((new Date().getTime() - lastCheckedIn?.getTime()) / (1000 * 3600 * 24)) : null;
  const hasCheckedInToday = hasAlreadyCheckedIn && toDaysAgo! < 1;

  return (
      <Pressable onPointerLeave={toggleDeleteFriend} onLongPress={toggleDeleteFriend}>
        <View style={[styles.friendContainer, {backgroundColor, borderColor}]}>
          <View style={styles.friendNameContainer}>
            <FontAwesome6 color={borderColor} size="24" name="face-smile-beam"/>
            <View>
              <ThemedText style={styles.friendName}>{contact.firstName}</ThemedText>
              {hasAlreadyCheckedIn ?
                hasCheckedInToday ? <ThemedText>Checked in today</ThemedText> : <ThemedText>Checked in {toDaysAgo} days ago</ThemedText>
                :
                <ThemedText>Never checked in yet !</ThemedText>
              }
            </View>
          </View>
          {isOnDeleteMode ? <AdditionalButtons onPress={promptForFriendDeletion}/> : <CheckInButton onPress={checkInOnFriend} disabled={hasCheckedInToday}/>}
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
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {contacts.map(contact => <FriendLine key={contact.id} contact={contact} />)}
    </View>
  ) : null;
}

export default function Profile() {
  const [yearlyContacts, setYearlyContacts] = useState<ContactModel[]>([]);
  const [weeklyContacts, setWeeklyContacts] = useState<ContactModel[]>([]);
  const [monthlyContacts, setMonthlyContacts] = useState<ContactModel[]>([]);
  const { friends, deleteFriend } = useContacts();
  const { checkInsRepository } = useCheckIns();

  const getAllFriends = useCallback(() => {
    const contacts = friends;
    setYearlyContacts(contacts.filter(contact => contact.frequency === 'yearly'));
    setWeeklyContacts(contacts.filter(contact => contact.frequency === 'weekly'));
    setMonthlyContacts(contacts.filter(contact => contact.frequency === 'monthly'));
  }, [friends]);

  useEffect(() => {
    getAllFriends();
  }, [friends]);

  const wipeAllDatabases = () => {
    checkInsRepository.deleteAllCheckIns();
    friends
      .map(friend => friend.id)
      .filter(friendId => friendId !== null && friendId !== undefined)
      .forEach(friendId => deleteFriend(friendId));
  }

  const wipeAll = () => {
    Alert.alert('Are you sure you want to wipe all databases ?', 'This action is irreversible', [
      {
        text: 'No',
        onPress: () => {
          return;
        }
      },
      {
        text: 'Yes',
        onPress: () => {
          wipeAllDatabases();
        }
      },
    ]);
  }

  return (
    <ThemedView>
      <View style={{flex: 1, width: '100%', paddingTop: 30}}>
        <Button title="Clear databases" onPress={wipeAll}/>
        {friends.length === 0 ? 
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, gap: 15}}>
          <ThemedText type={'subtitle'}>C'est vide ici 😭 !</ThemedText>
          <ThemedText type={'defaultSemiBold'}>Cliquer en haut à gauche pour catch'up ↗️ </ThemedText>
        </View>
        : 
        <View style={{flex: 1, gap: 30}}>
          <Section title='Weekly' contacts={weeklyContacts}/>
          <Section title="Monthly" contacts={monthlyContacts} />
          <Section title="Yearly" contacts={yearlyContacts} />
        </View>
      }
      </View>
    </ThemedView>
  );
}

