import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { NotificationsService } from "./Notification.service";
import * as Notifications from 'expo-notifications';
import { Alert } from "react-native";
import { ReminderFrequencyUtils } from "@/repositories/contacts/ReminderFrequency";
import * as TaskManager from 'expo-task-manager';

const CHANNEL_ID = 'LOCAL_NOTIFICATIONS';
const PERMISSION_GRANTED = "granted";
const NOTIFICATION_TASK_NAME = "background-notification-task";

const sendNotificationForContact = async (contact: ContactModel): Promise<void> => {
    // TaskManager.defineTask(NOTIFICATION_TASK_NAME, ({ data, error, executionInfo }) => {
    //    console.log('Received a notification in the background! : ')
    //    console.log(JSON.stringify(data, null, 2));
    //  });
    

    // Notifications.registerTaskAsync(NOTIFICATION_TASK_NAME);
    console.log('Sending notification for contact : ', contact);
    Notifications.scheduleNotificationAsync({
      content: {
        title: `Pauvre ${contact.firstName} ! 😭`,
        body: `Ça fait ${ReminderFrequencyUtils.translateFrequencyToFrench(contact.frequency)} que tu n'as pas pris de ses news !`,
      },
      trigger: {
        seconds: 3
      }
    });
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
    sendNotificationForContact,
    requestPermission,
    initializeNotificationsSettings
};