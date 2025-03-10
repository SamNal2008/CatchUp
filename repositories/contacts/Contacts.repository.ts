import { DateUtils } from "@/constants/DateUtils";
import { logService } from "@/services/log.service";
import * as Contact from "expo-contacts";
import * as SQLite from "expo-sqlite";
import {
  ContactEntity,
  ContactId,
  ContactModel,
  createNewContactEntity,
  dateToISOString,
  isoStringToDate,
} from "./ContactEntity";

export const DATABASE_NAME = "catch_up.db";

export interface ContactsRepository {
  addNewFriend: (contactToSave: ContactModel) => Promise<ContactModel>;
  update: (contactToUpdate: ContactModel) => Promise<ContactModel>;
  getById: (contactId: ContactId) => Promise<ContactModel | null>;
  remove: (contactId: ContactId) => Promise<void>;
  getAll: () => Promise<ContactModel[]>;
}

class LocalRepository implements ContactsRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  static readonly TABLE_NAME = "contacts";

  public async addNewFriend(
    contactToSave: ContactModel,
  ): Promise<ContactModel> {
    if (!contactToSave?.id) {
      throw new Error(
        "Unable to save contact without id : " + JSON.stringify(contactToSave),
      );
    }

    const formattedBirthday = dateToISOString(contactToSave.birthDate);

    try {
      // First check if the contact already exists in the database
      const existingContact = await this.db.getFirstAsync<ContactEntity>(
        `SELECT * FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`,
        [contactToSave.id],
      );

      if (existingContact) {
        // Contact already exists, use update instead
        logService.info(
          `Contact already exists in database, updating instead of inserting: ${contactToSave.id}`,
        );
        return await this.update(contactToSave);
      }

      // Contact doesn't exist, proceed with insert
      const res = this.db.runSync(
        `INSERT INTO ${LocalRepository.TABLE_NAME} (contact_id, frequency, birthday) VALUES (?, ?, ?)`,
        [contactToSave.id, contactToSave.frequency, formattedBirthday],
      );

      if (res.changes <= 0) {
        throw new Error("No rows were affected when saving contact");
      }

      return contactToSave;
    } catch (error) {
      // Specific handling for constraint errors
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        logService.warn(
          `Contact already exists, attempting to update instead: ${contactToSave.id}`,
        );
        try {
          // If we get a unique constraint error, try updating instead
          return await this.update(contactToSave);
        } catch (updateError) {
          logService.error("Error updating existing contact:", updateError);
          throw new Error(
            `Unable to save or update contact with ID: ${contactToSave.id}`,
          );
        }
      }

      logService.error("Error saving contact to database:", error);
      throw new Error(`Unable to save contact with ID: ${contactToSave.id}`);
    }
  }

  public async update(contactToUpdate: ContactModel): Promise<ContactModel> {
    if (!contactToUpdate?.id) {
      throw new Error(
        "Unable to update contact without id : " +
          JSON.stringify(contactToUpdate),
      );
    }

    const formattedBirthday = dateToISOString(contactToUpdate.birthDate);

    try {
      // First check if the contact exists in the database
      const existingContact = await this.db.getFirstAsync<ContactEntity>(
        `SELECT * FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`,
        [contactToUpdate.id],
      );

      if (!existingContact) {
        // If the contact doesn't exist, insert it instead of updating
        logService.info(
          `Contact does not exist in database, inserting instead of updating: ${contactToUpdate.id}`,
        );
        return await this.addNewFriend(contactToUpdate);
      }

      // Contact exists, proceed with update
      const result = await this.db.runAsync(
        `UPDATE ${LocalRepository.TABLE_NAME} SET frequency = ?, birthday = ? WHERE contact_id = ?`,
        [contactToUpdate.frequency, formattedBirthday, contactToUpdate.id],
      );

      if (!result || result.changes === 0) {
        throw new Error(`No contact found with ID: ${contactToUpdate.id}`);
      }

      return contactToUpdate;
    } catch (error) {
      logService.error("Error updating contact in database:", error);
      throw new Error(
        `Failed to update contact with ID: ${contactToUpdate.id}`,
      );
    }
  }

  public async getById(contactId: ContactId): Promise<ContactModel | null> {
    try {
      const entity = await this.db.getFirstAsync<ContactEntity>(
        `SELECT * FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`,
        [contactId],
      );

      if (!entity) return null;

      try {
        // Try to get contact from phone, but handle gracefully if not available
        const contactInPhone = await Contact.getContactByIdAsync(contactId);

        if (!contactInPhone) {
          logService.warn(
            `Contact with ID ${contactId} not found in user phone, but exists in database`,
          );
          // Create a minimal contact object from our database data
          const minimalContact: Contact.Contact = {
            id: contactId,
            name: "", // We might not have this data in our database
            firstName: "", // Placeholder, as we don't have this in our database
            contactType: "person",
          };

          const birthDate = entity.birthday
            ? isoStringToDate(entity.birthday)
            : null;

          return createNewContactEntity({
            contact: minimalContact,
            frequency: entity.frequency,
            birthDate,
            lastCheckin: null, // We might need to add this to our database schema
          });
        }

        // Normal flow when contact exists in phone
        const birthDate = entity.birthday
          ? isoStringToDate(entity.birthday)
          : DateUtils.getBirthDateFromBirthday(contactInPhone);

        return createNewContactEntity({
          contact: contactInPhone,
          frequency: entity.frequency,
          birthDate,
          lastCheckin: null,
        });
      } catch (phoneError) {
        // Handle the case where we can't access the phone contacts
        logService.error(
          `Error accessing phone contact with ID ${contactId}:`,
          phoneError,
        );
        logService.info("Returning database-only contact information");

        // Create a minimal contact from our database
        const minimalContact: Contact.Contact = {
          id: contactId,
          name: "",
          firstName: "",
          contactType: "person",
        };

        const birthDate = entity.birthday
          ? isoStringToDate(entity.birthday)
          : null;

        return createNewContactEntity({
          contact: minimalContact,
          frequency: entity.frequency,
          birthDate,
          lastCheckin: null,
        });
      }
    } catch (error) {
      logService.error(`Error fetching contact with ID ${contactId}:`, error);
      throw error;
    }
  }

  public async getAll(): Promise<ContactModel[]> {
    try {
      const entities = await this.db.getAllAsync<ContactEntity>(
        `SELECT * FROM ${LocalRepository.TABLE_NAME}`,
      );

      const result: ContactModel[] = [];

      for (const entity of entities) {
        try {
          // Try to get the contact from phone first
          let contactInPhone: Contact.Contact | null = null;

          try {
            contactInPhone =
              (await Contact.getContactByIdAsync(entity.contact_id, [
                Contact.Fields.ID,
                Contact.Fields.FirstName,
                Contact.Fields.LastName,
                Contact.Fields.Image,
                Contact.Fields.Birthday,
              ])) || null;
          } catch (phoneError) {
            logService.warn(
              `Couldn't fetch phone contact for ID ${entity.contact_id}:`,
              phoneError,
            );
          }

          // If the contact doesn't exist in the phone anymore, create a minimal record
          if (!contactInPhone) {
            logService.warn(
              `Contact with ID: ${entity.contact_id} not found in phone anymore, using database data only`,
            );

            // Create a minimal contact from our database data
            const minimalContact: Contact.Contact = {
              id: entity.contact_id,
              name: "", // We might want to store name in the database in the future
              firstName: "",
              contactType: "person",
            };

            const birthDate = entity.birthday
              ? isoStringToDate(entity.birthday)
              : null;

            result.push(
              createNewContactEntity({
                contact: minimalContact,
                frequency: entity.frequency,
                birthDate,
                lastCheckin: null,
              }),
            );

            continue;
          }

          // Normal flow when contact exists in phone
          const birthDate = entity.birthday
            ? isoStringToDate(entity.birthday)
            : DateUtils.getBirthDateFromBirthday(contactInPhone);

          result.push(
            createNewContactEntity({
              contact: contactInPhone,
              frequency: entity.frequency,
              birthDate,
              lastCheckin: null,
            }),
          );
        } catch (error) {
          logService.error(
            `Error processing contact ${entity.contact_id}:`,
            error,
          );
          // Continue with next contact instead of failing entire operation
          continue;
        }
      }

      return result;
    } catch (error) {
      logService.error("Error fetching all contacts:", error);
      throw error;
    }
  }

  public async remove(contactId: string): Promise<void> {
    try {
      const result = await this.db.runAsync(
        `DELETE FROM ${LocalRepository.TABLE_NAME} WHERE contact_id = ?`,
        [contactId],
      );

      if (!result || result.changes === 0) {
        throw new Error(`No contact found with ID: ${contactId}`);
      }
    } catch (error) {
      logService.error(`Error removing contact ${contactId}:`, error);
      throw error;
    }
  }
}

export const getContactsRepository = (db: SQLite.SQLiteDatabase) => {
  return new LocalRepository(db);
};
