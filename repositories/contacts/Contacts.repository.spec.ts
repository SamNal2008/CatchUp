import { getContactsRepository } from "./Contacts.repository";
import * as SQLite from "expo-sqlite";


describe('ContactsRepository', () => {

    const dbMock = jest.mock('expo-sqlite');

    const mockDb = jest.fn().mockImplementation(() => ({
        runSync: jest.fn(),
        close: jest.fn(),
        openDatabaseSync: jest.fn(),
        getAllAsync: jest.fn()
    })) as unknown as SQLite.SQLiteDatabase;

    it('should get all contacts from the database for the current user', async () => {
        const contactsRepository = getContactsRepository(mockDb);
        const allContacts = await contactsRepository.getAll();
        expect(allContacts.length).toEqual(0);
    });
});