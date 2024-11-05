import {ContactModel} from "@/repositories/contacts/ContactEntity";
import {NotificationsService} from "./Notification.service";
import * as Notifications from 'expo-notifications';
import {Alert} from "react-native";
import {getRandomBetween, ReminderFrequencyUtils} from "@/repositories/contacts/ReminderFrequency";
import {NotificationId, NotificationModel} from "@/repositories/notifications/NotificationEntity";

const registerNotificationForContact = (contact: ContactModel): Promise<string> => {
    return Notifications.scheduleNotificationAsync({
        content: {
            title: `Catch’up with ${contact.firstName} !`,
            body: `You last checked in ${ReminderFrequencyUtils.translateFrequencyToEnglish(contact.frequency)} ago`,
        },
        trigger: ReminderFrequencyUtils.getNextNotificationTrigger(contact.frequency),
    });
}

const requestPermission = async (): Promise<void> => {
    const {granted} = await Notifications.requestPermissionsAsync();
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

const deleteNotificationAndCreateNewPostponed = async (notificationId: NotificationId, contact: ContactModel): Promise<NotificationModel> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    const newNotificationId = await registerNotificationForContact(contact);
    return {
        contact: contact,
        notificationId: newNotificationId
    };
}

const registerBirthdayNotificationForContact = (contact: ContactModel): any => {
    if (!contact.birthDate) {
        return;
    }
    return Notifications.scheduleNotificationAsync({
        content: {
            title: `It’s ${contact.firstName}’s birthday 🎉`,
            body: `Send wishes, make their day!`,
        },
        trigger: {
            channelId: 'default',
            month: contact.birthDate.getMonth() + 1,
            day: contact.birthDate.getDate(),
            hour: getRandomBetween([{min: 9, max: 10}]),
            minute: getRandomBetween([{min: 0, max: 59}]),
        }
    });
}

const clearAllNotifications = () => {
    Notifications.cancelAllScheduledNotificationsAsync();
}

export const localNotificationService: NotificationsService = {
    registerNotificationForContact,
    requestPermission,
    initializeNotificationsSettings,
    deleteNotificationAndCreateNewPostponed,
    registerBirthdayNotificationForContact,
    clearAllNotifications
};