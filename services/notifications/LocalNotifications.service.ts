import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { NotificationsService } from "./Notification.service";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Alert } from "react-native";
import {
  getRandomBetween,
  ReminderFrequencyUtils,
} from "@/repositories/contacts/ReminderFrequency";
import {
  NotificationId,
  NotificationModel,
} from "@/repositories/notifications/NotificationEntity";
import { logService } from "@/services/log.service";

const registerNotificationForContact = (
  contact: ContactModel,
  checkinDate: Date,
): Promise<string> => {
  if (contact.frequency === "never") {
    return Promise.resolve("no-notification");
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Catch’up with ${contact.firstName} !`,
      body: `You last checked in ${ReminderFrequencyUtils.translateFrequencyToEnglish(contact.frequency)} ago`,
    },
    trigger: ReminderFrequencyUtils.getNextNotificationTrigger(
      contact.frequency,
      checkinDate,
    ),
  });
};

const requestPermission = async (): Promise<void> => {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) {
    Alert.alert(
      "Pas de notis, pas d'amis !",
      "Sans les notifications, Catch'up ne pourra pas vous informer de vos contacts à relancer.",
    );
  }
};

const initializeNotificationsSettings = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

const deleteNotificationAndCreateNewPostponed = async (
  notificationId: NotificationId,
  contact: ContactModel,
  checkinDate: Date,
): Promise<NotificationModel> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  const newNotificationId = await registerNotificationForContact(
    contact,
    checkinDate,
  );
  return {
    contact: contact,
    notificationId: newNotificationId,
  };
};

const registerBirthdayNotificationForContact = (contact: ContactModel): any => {
  if (!contact.birthDate) {
    return;
  }
  const base12Month = (contact.birthDate.getMonth() + 1) % 12;
  const birthday = contact.birthDate.getDate();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `It’s ${contact.firstName}’s birthday 🎉`,
      body: `Send wishes, make their day!`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.YEARLY,
      channelId: "default",
      month: base12Month,
      day: birthday,
      hour: getRandomBetween([{ min: 9, max: 10 }]),
      minute: getRandomBetween([{ min: 0, max: 59 }]),
    },
  });
};

const clearAllNotifications = () => {
  Notifications.cancelAllScheduledNotificationsAsync();
};

const deleteNotificationWithId = async (notificationId: NotificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    logService.warn(
      `Notification with ID : ${notificationId} could not have been deleted`,
      e,
    );
  }
};

const hasNotificationEnabledOnPhone = async (): Promise<boolean> => {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.granted;
};

export const localNotificationService: NotificationsService = {
  registerNotificationForContact,
  requestPermission,
  initializeNotificationsSettings,
  deleteNotificationAndCreateNewPostponed,
  registerBirthdayNotificationForContact,
  clearAllNotifications,
  deleteNotificationWithId,
  hasNotificationEnabledOnPhone,
};
