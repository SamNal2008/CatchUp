import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { localNotificationService } from "./LocalNotifications.service";
import {
  NotificationId,
  NotificationModel,
} from "@/repositories/notifications/NotificationEntity";

export interface NotificationsService {
  deleteNotificationAndCreateNewPostponed(
    notificationId: NotificationId,
    contact: ContactModel,
    checkInDate: Date,
  ): Promise<NotificationModel>;
  initializeNotificationsSettings(): void;
  registerNotificationForContact(
    contact: ContactModel,
    lastCheckinDate: Date,
  ): Promise<string>;
  requestPermission(): void;
  registerBirthdayNotificationForContact(contact: ContactModel): any;
  clearAllNotifications(): void;
  deleteNotificationWithId(notificationId: NotificationId): Promise<void>;
  hasNotificationEnabledOnPhone(): Promise<boolean>;
}

export const getNotificationsService = (): NotificationsService =>
  localNotificationService;
