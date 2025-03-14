import { DateUtils } from "@/constants/DateUtils";
import { CheckInEntity, ContactId, ReminderFrequency } from "@/repositories";
import { logService } from "@/services/log.service";
import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "catch_up.db";

export interface CheckInsRepository {
  checkInOnContact: (checkInEntity: CheckInEntity) => void;
  getLatestCheckInForContact: (contactId?: ContactId) => CheckInEntity | null;
  hasAlreadyCheckedInWantedFrequency: (
    contactId: ContactId,
    wantedFrequency: ReminderFrequency,
  ) => boolean;
  deleteAllCheckIns: () => void;
  deleteAllCheckInWithContactId: (contactId: ContactId) => void;
  getAllCheckIns: () => CheckInEntity[];
}

class LocalCheckInsRepository implements CheckInsRepository {
  static readonly TABLE_NAME = "check_ins";

  constructor(private readonly db: SQLite.SQLiteDatabase) {}
  public deleteAllCheckIns(): void {
    this.db.runSync(`DELETE FROM ${LocalCheckInsRepository.TABLE_NAME}`);
  }

  public hasAlreadyCheckedInWantedFrequency(
    contactId: ContactId,
    wantedFrequency: ReminderFrequency,
  ): boolean {
    const daysAgoWanted = DateUtils.getDaysAgoFromFrequency(wantedFrequency);
    return (
      this.db.getFirstSync<boolean>(
        `SELECT COUNT(*) > 0 FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ? AND check_in_date >= ?`,
        [
          contactId,
          new Date(
            new Date().getTime() - daysAgoWanted.getTime(),
          ).toISOString(),
        ],
      ) ?? false
    );
  }

  public checkInOnContact(checkIn: CheckInEntity): void {
    const res = this.db.runSync(
      `INSERT INTO ${LocalCheckInsRepository.TABLE_NAME} (contact_id, check_in_date, note_content) VALUES (?, ?, ?)`,
      [
        checkIn.contact_id,
        checkIn.check_in_date.toISOString(),
        checkIn.note_content ?? "",
      ],
    );
    if (res.changes > 0) {
      return;
    }
    throw new Error(
      "Unable to check in on contact with ID : " + checkIn.contact_id,
    );
  }

  public getLatestCheckInForContact(
    contactId?: ContactId,
  ): CheckInEntity | null {
    if (!contactId) {
      return null;
    }
    const res =
      this.db.getFirstSync<CheckInEntity>(
        `SELECT * FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ? ORDER BY check_in_date DESC LIMIT 1`,
        [contactId],
      ) ?? null;
    if (!res) {
      return null;
    }
    return res;
  }

  public deleteAllCheckInWithContactId(contactId: ContactId): void {
    try {
      this.db.runSync(
        `DELETE FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ?`,
        [contactId],
      );
    } catch (e) {
      logService.warn(
        `Could not delete all check in for contact id : ${contactId}`,
        e,
      );
    }
  }

  public getAllCheckIns(): CheckInEntity[] {
    return (
      this.db.getAllSync<CheckInEntity>(
        `SELECT * FROM ${LocalCheckInsRepository.TABLE_NAME}`,
      ) ?? []
    );
  }
}

export const getCheckInsRepository = (
  db: SQLite.SQLiteDatabase,
): CheckInsRepository => {
  return new LocalCheckInsRepository(db);
};
