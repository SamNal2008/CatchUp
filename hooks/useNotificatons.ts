import { ContactModel } from "@/repositories";
import { getNotificationRepository } from "@/repositories/notifications/Notification.repository";
import { getNotificationsService, NotificationsService } from "@/services/notifications/Notification.service";
import { useSQLiteContext } from "expo-sqlite";

type UseNotifications = {
    askForNotificationPermission: () => void;
    registerFriendNotificationReminder: (contact: ContactModel) => void;
    registerFriendNotificationBirthdayReminder: (contact: ContactModel) => void;
    postPoneReminder: (contact: ContactModel) => void;
    clearAllNotifications: () => void;
};

export const useNotifications = (): UseNotifications => {
    const db = useSQLiteContext();
    const notificationsService = getNotificationsService();
    const notificationRepository = getNotificationRepository(db);

    const clearAllNotifications = () => {
        notificationRepository.clearAllNotifications();
        notificationsService.clearAllNotifications();
    }

    const askForNotificationPermission = () => {
        notificationsService.initializeNotificationsSettings();
        notificationsService.requestPermission();
    };

    const registerFriendNotificationReminder = async (contact: ContactModel) => {
        try {
            const notificationId = await notificationsService.registerNotificationForContact(contact);
            notificationRepository.saveReminder({
                notification_id: notificationId,
                frequency: contact.frequency,
                contact_id: contact.id!
            });
        } catch (e) {
            console.error(`Unable to register notification for contact ${contact.id}`, e);
        }
    }

    const registerFriendNotificationBirthdayReminder = async (contact: ContactModel) => {
        try {
            const notificationId = await notificationsService.registerBirthdayNotificationForContact(contact);
        } catch (e) {
            console.error(`Unable to register birthday notification for contact ${contact.id}`, e);
        }
    }

    const postPoneReminder = async (contact: ContactModel) => {
        if (!contact.id) {
            console.error(`Unable to postpone notification for contact without id`);
            return;
        }
        const notification = notificationRepository.getReminder(contact.id);
        if (!notification) {
            console.error(`Unable to get notification for contact ${contact.id}`);
            return;
        }
        try {
            const newNotification = await notificationsService.deleteNotificationAndCreateNewPostponed(notification.notification_id, contact);
            notificationRepository.updateReminder({
                notification_id: newNotification.notificationId,
                contact_id: contact.id,
                frequency: contact.frequency
            });
        } catch (e) {
            console.error(`Unable to postpone notification for contact ${contact.id}`, e);
        }
    }

    return { askForNotificationPermission, registerFriendNotificationReminder, postPoneReminder, clearAllNotifications, registerFriendNotificationBirthdayReminder };
};
