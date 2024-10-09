import * as SQLite from "expo-sqlite";
import * as Contact from 'expo-contacts';
import { ContactModel, ContactId, ContactEntity, createNewContactEntity } from "../contacts/ContactEntity";
import { ReminderFrequency } from "../contacts/ReminderFrequency";
import { CheckInEntity } from "./CheckInEntity";

export const DATABASE_NAME = "catch_up.db";

export interface CheckInsRepository {
  checkInOnContact: (contactToCheckInId: ContactId) => void;
  getLatestCheckInForContact: (contactId?: ContactId) => Date | null;
  hasAlreadyCheckedInWantedFrequency: (contactId: ContactId, wantedFrequency: ReminderFrequency) => boolean;
  deleteAllCheckIns: () => void;
}

class LocalCheckInsRepository implements CheckInsRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}
  public deleteAllCheckIns(): void {
    this.db.runSync('DELETE FROM check_ins');
  }
  
  public hasAlreadyCheckedInWantedFrequency(contactId: ContactId, wantedFrequency: ReminderFrequency): boolean {
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
    let daysAgoWanted;
    if (wantedFrequency === 'monthly') {
      daysAgoWanted = thirtyDaysAgo;
    }
    if (wantedFrequency === 'weekly') {
      daysAgoWanted = oneWeekAgo;
    }
    if (wantedFrequency === 'yearly') {
      daysAgoWanted = oneYearAgo;
    }
    if (!daysAgoWanted) {
      throw new Error('Invalid wanted frequency : ' + wantedFrequency);
    }
    console.log(daysAgoWanted);
    return this.db.getFirstSync<boolean>('SELECT COUNT(*) > 0 FROM check_ins WHERE contact_id = ? AND check_in_date >= ?',
      [contactId, new Date(new Date().getTime() - daysAgoWanted.getTime()).toISOString()]) ?? false;
  }

  public checkInOnContact(contactToCheckInId: ContactId): void {
    const res = this.db.runSync(`INSERT INTO check_ins (contact_id, check_in_date) VALUES (?, ?)`, [contactToCheckInId, new Date().toISOString()]);
    if (res.changes > 0){
      return;
    }
    throw new Error('Unable to check in on contact with ID : ' + contactToCheckInId);
  }

  public getLatestCheckInForContact(contactId?: ContactId): Date | null {
    if (!contactId) {
      return null;
    }
    const res = this.db.getFirstSync<CheckInEntity>('SELECT check_in_date FROM check_ins WHERE contact_id = ? ORDER BY check_in_date DESC LIMIT 1', [contactId])?.check_in_date ?? null;
    if (!res) {
      return null;
    }
    return new Date(res);
  }
}

export const getCheckInsRepository = (db: SQLite.SQLiteDatabase): CheckInsRepository => {
  return new LocalCheckInsRepository(db);
}
