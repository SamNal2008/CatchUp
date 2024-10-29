import * as SQLite from "expo-sqlite";
import * as Contact from 'expo-contacts';
import { ContactModel, ContactId, ContactEntity, createNewContactEntity } from "./ContactEntity";
import {DateUtils} from "@/constants/DateUtils";

export const DATABASE_NAME = "catch_up.db";

export interface ContactsRepository {
  addNewFriend: (contactToSave: ContactModel) => Promise<ContactModel>;
  update: (contactToUpdate: ContactModel) => Promise<ContactModel>;
  getById: (contactId: ContactId) => Promise<ContactModel | null>;
  remove: (contactId: ContactId) => Promise<void>;
  getAll: () => Promise<Array<ContactModel>>;
}

class LocalRepository implements ContactsRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) { }

  static readonly TABLE_NAME = 'contacts';

  public async addNewFriend(contactToSave: ContactModel): Promise<ContactModel> {
    if (!contactToSave?.id) {
      throw new Error('Unable to save contact without id : ' + JSON.stringify(contactToSave));
    }
    const res = this.db.runSync(`INSERT INTO ${LocalRepository.TABLE_NAME} (contact_id, frequency) VALUES (?, ?)`, [contactToSave.id, contactToSave.frequency]);
    if (res.changes <= 0) {
      throw new Error('Unable to save contact with ID : ' + contactToSave.id);
    }

    return contactToSave;
  }

  public async update(contactToUpdate: ContactModel): Promise<ContactModel> {
    if (!contactToUpdate?.id) {
      throw new Error('Unable to update contact without id : ' + JSON.stringify(contactToUpdate));
    }
    this.db.runAsync(`UPDATE ${LocalRepository.TABLE_NAME} SET frequency = ? WHERE contact_id = ?`, [contactToUpdate.frequency, contactToUpdate.id]);
    return contactToUpdate;
  }

  public async getById(contactId: ContactId): Promise<ContactModel | null> {
    const entity = await this.db.getFirstAsync<ContactEntity>(`SELECT * FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`, [contactId]);
    if (entity === null) {
      return null;
    }
    const contactInPhone = await Contact.getContactByIdAsync(contactId);
    if (!contactInPhone) {
      throw new Error(`Contact with ID ${contactId} not found in user phone`);
    }
    return createNewContactEntity({contact: contactInPhone, frequency: entity.frequency, birthDate: DateUtils.getBirthDateFromBirthday(contactInPhone), lastCheckin: null});
  }

  public async getAll(): Promise<Array<ContactModel>> {
    const result = new Array<ContactModel>();
    const entities: ContactEntity[] = await this.db.getAllAsync<ContactEntity>(`SELECT * FROM ${LocalRepository.TABLE_NAME}`);
    for (const entity of entities) {
      const contactInPhone: Contact.Contact | undefined = await Contact.getContactByIdAsync(entity.contact_id, [Contact.Fields.ID, Contact.Fields.FirstName, Contact.Fields.LastName, Contact.Fields.Image, Contact.Fields.Birthday]);
      if (!contactInPhone) {
        console.warn(`Contact with ID : ${entity.contact_id} not found in phone anymore`);
        continue;
      }
      result.push(createNewContactEntity({contact: contactInPhone, frequency: entity.frequency, birthDate: DateUtils.getBirthDateFromBirthday(contactInPhone), lastCheckin: null}));
    }
    return result;
  }

  public async remove(contactId: string): Promise<void> {
    this.db.runAsync(`DELETE FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`, [contactId]);
  }
}

export const getContactsRepository = (db: SQLite.SQLiteDatabase) => {
  return new LocalRepository(db);
}
