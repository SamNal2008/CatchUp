import {ContactId, ContactModel} from "@/repositories";
import {getNotificationRepository} from "@/repositories/notifications/Notification.repository";
import {getNotificationsService} from "@/services/notifications/Notification.service";
import {useSQLiteContext} from "expo-sqlite";
import {logService} from "@/services/log.service";

type UseNotifications = {
    askForNotificationPermission: () => void;
    registerFriendNotificationReminder: (contact: ContactModel) => void;
    registerFriendNotificationBirthdayReminder: (contact: ContactModel) => void;
    postPoneReminder: (contact: ContactModel, checkinDate: Date) => void;
    clearAllNotifications: () => void;
    deleteFriendNotification: (contactId: ContactId) => Promise<void>;
    hasNotificationEnabledOnPhone: () => Promise<boolean>;
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
            const notificationId = await notificationsService.registerNotificationForContact(contact, contact.lastCheckin ?? new Date());
            notificationRepository.saveReminder({
                notification_id: notificationId,
                frequency: contact.frequency,
                contact_id: contact.id!
            });
        } catch (e) {
            logService.error(`Unable to register notification for contact ${contact.id}`, e);
        }
    }

    const hasNotificationEnabledOnPhone = () => {
        return notificationsService.hasNotificationEnabledOnPhone();
    }

    const registerFriendNotificationBirthdayReminder = async (contact: ContactModel) => {
        try {
            const notificationId = await notificationsService.registerBirthdayNotificationForContact(contact);
        } catch (e) {
            logService.error(`Unable to register birthday notification for contact ${contact.id}`, e);
        }
    }

    const postPoneReminder = async (contact: ContactModel, checkinDate: Date) => {
        if (!contact.id) {
            logService.error(`Unable to postpone notification for contact without id`);
            return;
        }
        const notification = notificationRepository.getReminder(contact.id);
        if (!notification) {
            logService.error(`Unable to get notification for contact ${contact.id}`);
            return;
        }
        try {
            const newNotification = await notificationsService.deleteNotificationAndCreateNewPostponed(notification.notification_id, contact, checkinDate);
            notificationRepository.updateReminder({
                notification_id: newNotification.notificationId,
                contact_id: contact.id,
                frequency: contact.frequency
            });
        } catch (e) {
            logService.error(`Unable to postpone notification for contact ${contact.id}`, e);
        }
    }

    const deleteFriendNotification = async (contactId: ContactId) => {
        const notification = notificationRepository.getReminder(contactId);
        if (!notification) {
            logService.warn('Notification not found for friend with contact id : ' + contactId);
            return;
        }
        notificationRepository.deleteReminder(notification.notification_id);
        await notificationsService.deleteNotificationWithId(notification.notification_id);
    }

    return { askForNotificationPermission, registerFriendNotificationReminder, postPoneReminder, clearAllNotifications, registerFriendNotificationBirthdayReminder, deleteFriendNotification, hasNotificationEnabledOnPhone };
};
