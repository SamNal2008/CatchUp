import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { localNotificationService } from "./LocalNotifications.service";

export interface NotificationsService {
  initializeNotificationsSettings(): void;
  registerNotificationForContact(contact: ContactModel): Promise<string>;
  requestPermission(): void;
}

export const getNotificationsService = (): NotificationsService => localNotificationService;

// const NOTIFICATION_TASK_NAME = "background-notification-task";

// TaskManager.defineTask(NOTIFICATION_TASK_NAME, ({ data, error }) => {
//   if (error) {
//     // Error occurred - check `error.message` for more details.
//     return;
//   }
//   if (data) {
//     console.log(data);
//     // do something with the locations captured in the background
//   }
// });
