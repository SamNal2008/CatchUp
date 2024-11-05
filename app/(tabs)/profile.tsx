import { ThemedView } from "@/components/ThemedView";
import { useContacts } from "@/contexts/Contact.context";
import { useCallback, useEffect, useState } from "react";
import { ContactModel } from "@/repositories";
import { View, StyleSheet, Pressable, Alert, Button, Image } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FontAwesome6 } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCheckIns } from "@/contexts/CheckIns.context";
import { useNotifications } from "@/hooks/useNotificatons";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {SymbolView} from "expo-symbols";
import {Colors} from "@/constants/design";
import {useColorSchemeOrDefault} from "@/hooks/useColorScheme";

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
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
  },
  friendNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  }
});

type CheckInButtonProps = {
  onPress?: () => void;
}


const AdditionalButtons = ({ onPress }: CheckInButtonProps) => {
  const theme = useColorSchemeOrDefault();
  return (
    <View style={[{maxWidth: '20%', alignSelf: 'center', alignItems: 'center', width: '100%', justifyContent: 'center', flexDirection: 'row'}, styles.additionalButton]}>
      <Pressable onPress={onPress}>
        <SymbolView name="trash.fill" tintColor={Colors[theme].background}/>
      </Pressable>
    </View>
  );
}

const FriendLine = ({ contact }: { contact: ContactModel }) => {
  const borderColor = useThemeColor('borderColor');
  const { deleteFriend, friends } = useContacts();
  const { checkInsRepository } = useCheckIns();
  const { postPoneReminder, askForNotificationPermission } = useNotifications();


  const [isOnDeleteMode, setIsOnDeleteMode] = useState<boolean>(false);
  const toggleDeleteFriend = () => {
    setIsOnDeleteMode((prev) => !prev);
  };
  const [lastCheckedIn, setLastCheckedIn] = useState<Date | null>(null);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    if (friends.length > 0) {
      askForNotificationPermission();
    }
  }, []);

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
    postPoneReminder(contact);
    setReload(prev => !prev);
  }

  const hasAlreadyCheckedIn = lastCheckedIn !== null;
  const toDaysAgo = hasAlreadyCheckedIn ? Math.round((new Date().getTime() - lastCheckedIn?.getTime()) / (1000 * 3600 * 24)) : null;
  const hasCheckedInToday = hasAlreadyCheckedIn && toDaysAgo! < 1;

  return (
      <Swipeable renderRightActions={() => <AdditionalButtons onPress={() => deleteFriend(contact.id!)}/>}>
      <View style={[styles.friendContainer]}>
        <View style={styles.friendNameContainer}>
          {contact.image ?
            <Image source={contact.image} style={styles.friendImage} /> :
            <FontAwesome6 color={borderColor} size="24" name="face-smile-beam" />}
          <View>
            <ThemedText style={styles.friendName}>{contact.firstName}</ThemedText>
            {hasAlreadyCheckedIn ?
              hasCheckedInToday ?
                  <ThemedText type="subText">Checked in today</ThemedText> :
                  <ThemedText type="subText">Checked in {toDaysAgo} days ago</ThemedText>
                :
              <ThemedText type="subText">Never checked in yet !</ThemedText>
            }
          </View>
        </View>
        <PrimaryButton title={hasCheckedInToday ? 'Come later' : 'Check In'} onPress={checkInOnFriend} disabled={hasCheckedInToday} />
      </View>
    </Swipeable>
  )
}

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
  const [yearlyContacts, setYearlyContacts] = useState<ContactModel[]>([]);
  const [weeklyContacts, setWeeklyContacts] = useState<ContactModel[]>([]);
  const [monthlyContacts, setMonthlyContacts] = useState<ContactModel[]>([]);
  const [dailyContacts, setDailyContacts] = useState<ContactModel[]>([]);
  const { friends, deleteFriend } = useContacts();
  const { checkInsRepository } = useCheckIns();
  const { postPoneReminder, clearAllNotifications } = useNotifications();

  const getAllFriends = useCallback(() => {
    setYearlyContacts(friends.filter(contact => contact.frequency === 'yearly'));
    setWeeklyContacts(friends.filter(contact => contact.frequency === 'weekly'));
    setMonthlyContacts(friends.filter(contact => contact.frequency === 'monthly'));
    setDailyContacts(friends.filter(contact => contact.frequency === 'daily'));
  }, [friends]);

  useEffect(() => {
    getAllFriends();
  }, [friends]);

  const wipeAllDatabases = () => {
    checkInsRepository.deleteAllCheckIns();
    clearAllNotifications();
    friends
      .map(friend => friend.id)
      .filter(friendId => friendId !== null && friendId !== undefined)
      .forEach(friendId => deleteFriend(friendId!));
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
      <View style={{ flex: 1, width: '100%', paddingTop: 30 }}>
        <Button title="Clear databases" onPress={wipeAll} />
        {friends.length === 0 ?
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 15 }}>
            <ThemedText type={'subtitle'}>C'est vide ici 😭 !</ThemedText>
            <ThemedText type={'defaultSemiBold'}>Cliquer en haut à gauche pour catch'up ↗️ </ThemedText>
          </View>
          :
          <View style={{ flex: 1, gap: 30 }}>
            <Section title="Every day" contacts={dailyContacts} />
            <Section title='Every week' contacts={weeklyContacts} />
            <Section title="Every month" contacts={monthlyContacts} />
            <Section title="Every year" contacts={yearlyContacts} />
          </View>
        }
      </View>
    </ThemedView>
  );
}

