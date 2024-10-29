import * as SQLite from "expo-sqlite";
import { NotificationEntity, NotificationId } from "./NotificationEntity";
import { ContactId } from "@/repositories";

type NotificationRepository = {
    saveReminder: (notificationEntity: NotificationEntity) => void;
    getReminder: (contactId: ContactId) => NotificationEntity | null;
    updateReminder: (notificationEntity: NotificationEntity) => void
    deleteReminder: (contactId: ContactId) => void;
    clearAllNotifications: () => void;
}

class LocalRepository implements NotificationRepository {

    static readonly TABLE_NAME = 'notifications'

    constructor(private readonly db: SQLite.SQLiteDatabase) { }

    public saveReminder(notificationEntity: NotificationEntity) {
        if (!notificationEntity.contact_id || !notificationEntity.notification_id) {
            throw new Error('Unable to save notification without id or contact id');
        }
        const res = this.db.runSync(`INSERT INTO ${LocalRepository.TABLE_NAME} (notification_id, contact_id, frequency) VALUES (?, ?, ?)`, [notificationEntity.notification_id, notificationEntity.contact_id, notificationEntity.frequency]);
        if (res.changes <= 0) {
            throw new Error(`Unable to save notification : ${notificationEntity.contact_id} - ${notificationEntity.notification_id}`);
        }
        return notificationEntity;
    };

    public getReminder(contactId: ContactId): NotificationEntity | null {
        console.log(this.db.getFirstSync<NotificationEntity>(`SELECT * from ${LocalRepository.TABLE_NAME}`));
        const res = this.db.getFirstSync<NotificationEntity>(`SELECT * from ${LocalRepository.TABLE_NAME} where contact_id = ?`, [contactId]);
        if (!res) {
            return null;
        }
        return res;
    };

    public updateReminder(notificationEntity: NotificationEntity) {
        if (!notificationEntity.contact_id || !notificationEntity.notification_id) {
            throw new Error('Unable to update notification without id or contact id');
        }
        const res = this.db.runSync(`UPDATE ${LocalRepository.TABLE_NAME} SET notification_id = ?, frequency = ? where contact_id = ?`, [notificationEntity.notification_id, notificationEntity.frequency, notificationEntity.contact_id]);
        if (res.changes <= 0) {
            throw new Error(`Unable to update notification : ${notificationEntity.contact_id} - ${notificationEntity.notification_id}`);
        }
    }

    public deleteReminder(notificationId: NotificationId) {
        this.db.runSync(`DELETE from ${LocalRepository.TABLE_NAME} where notification_id = ?`, [notificationId]);
    };

    public clearAllNotifications() {
        this.db.runSync(`DELETE from ${LocalRepository.TABLE_NAME}`);
    }
}

export const getNotificationRepository = (db: SQLite.SQLiteDatabase) => {
    return new LocalRepository(db);
};