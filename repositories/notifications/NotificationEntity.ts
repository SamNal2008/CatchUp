import { ContactId, ContactModel } from "../contacts/ContactEntity";
import { ReminderFrequency } from "../contacts/ReminderFrequency";

export type NotificationId = string;

export type NotificationEntity = {
  notification_id: NotificationId;
  contact_id: ContactId;
  frequency: ReminderFrequency;
};

export type NotificationModel = {
  contact: ContactModel;
  notificationId: NotificationId;
};
