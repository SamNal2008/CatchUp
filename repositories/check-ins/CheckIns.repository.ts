import * as SQLite from "expo-sqlite";
import { ContactId, ReminderFrequency, CheckInEntity } from "@/repositories";
import { DateUtils } from "@/constants/DateUtils";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";

export const DATABASE_NAME = "catch_up.db";

export interface CheckInsRepository {
  checkInOnContact: (contactToCheckInId: ContactId) => void;
  getLatestCheckInForContact: (contactId?: ContactId) => CheckInEntity | null;
  hasAlreadyCheckedInWantedFrequency: (contactId: ContactId, wantedFrequency: ReminderFrequency) => boolean;
  deleteAllCheckIns: () => void;
  deleteAllCheckInWithContactId: (contactId: ContactId) => void;
}

class LocalCheckInsRepository implements CheckInsRepository {

  static readonly TABLE_NAME = 'check_ins';

  constructor(private readonly db: SQLite.SQLiteDatabase) {}
  public deleteAllCheckIns(): void {
    this.db.runSync(`DELETE FROM ${LocalCheckInsRepository.TABLE_NAME}`);
  }
  
  public hasAlreadyCheckedInWantedFrequency(contactId: ContactId, wantedFrequency: ReminderFrequency): boolean {
    const daysAgoWanted = DateUtils.getDaysAgoFromFrequency(wantedFrequency);
    return this.db.getFirstSync<boolean>(`SELECT COUNT(*) > 0 FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ? AND check_in_date >= ?`,
      [contactId, new Date(new Date().getTime() - daysAgoWanted.getTime()).toISOString()]) ?? false;
  }

  public checkInOnContact(contactToCheckInId: ContactId): void {
    const res = this.db.runSync(`INSERT INTO ${LocalCheckInsRepository.TABLE_NAME} (contact_id, check_in_date) VALUES (?, ?)`, [contactToCheckInId, new Date().toISOString()]);
    if (res.changes > 0){
      return;
    }
    throw new Error('Unable to check in on contact with ID : ' + contactToCheckInId);
  }

  public getLatestCheckInForContact(contactId?: ContactId): CheckInEntity | null {
    if (!contactId) {
      return null;
    }
    const res = this.db.getFirstSync<CheckInEntity>(`SELECT * FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ? ORDER BY check_in_date DESC LIMIT 1`, [contactId]) ?? null;
    if (!res) {
      return null;
    }
    return res;
  }

  public deleteAllCheckInWithContactId(contactId: ContactId): void {
    try {
      this.db.runSync(`DELETE FROM ${LocalCheckInsRepository.TABLE_NAME} WHERE contact_id = ?`, [contactId]);
    } catch (e) {
      console.warn(`Could not delete all check in for contact id : ${contactId}`, e);
    }
  }
}

export const getCheckInsRepository = (db: SQLite.SQLiteDatabase): CheckInsRepository => {
  return new LocalCheckInsRepository(db);
}
