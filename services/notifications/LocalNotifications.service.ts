import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { NotificationsService } from "./Notification.service";
import * as Notifications from 'expo-notifications';
import { Alert } from "react-native";
import { ReminderFrequencyUtils } from "@/repositories/contacts/ReminderFrequency";

const registerNotificationForContact = async (contact: ContactModel): Promise<string> => {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Pauvre ${contact.firstName} ! 😭`,
      body: `Ça fait ${ReminderFrequencyUtils.translateFrequencyToFrench(contact.frequency)} que tu n'as pas pris de ses news !`,
    },
    trigger: {
      seconds: ReminderFrequencyUtils.getNextNotificationSecondsInterval(contact.frequency),
      channelId: 'default'
    }
  });
  return notificationId;
}

const requestPermission = async (): Promise<void> => {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) {
    Alert.alert(
      "Pas de notis, pas d'amis !",
      "Sans les notifications, Catch'up ne pourra pas vous informer de vos contacts à relancer."
    );
  }
}

const initializeNotificationsSettings = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const localNotificationService: NotificationsService = {
  registerNotificationForContact,
  requestPermission,
  initializeNotificationsSettings
};