import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { localNotificationService } from "./LocalNotifications.service";
import {NotificationEntity, NotificationId, NotificationModel} from "@/repositories/notifications/NotificationEntity";

export interface NotificationsService {
  deleteNotificationAndCreateNewPostponed(notificationId: NotificationId, contact: ContactModel): Promise<NotificationModel>;
  initializeNotificationsSettings(): void;
  registerNotificationForContact(contact: ContactModel): Promise<string>;
  requestPermission(): void;
}

export const getNotificationsService = (): NotificationsService => localNotificationService;