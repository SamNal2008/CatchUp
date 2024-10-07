// import { ContactsRepository, LocalRepository } from "./Contacts.repository";

// describe('Contact repository', () => {

//     let contactsRepository: ContactsRepository;
//     const db = jest.fn();

//     beforeEach(() => {
//         contactsRepository = new LocalRepository(db);
//     })

//     it('should get all contacts from the database for the current user', async () => {
//         const allContacts = await contactsRepository.getAll();
//         expect(allContacts.length).toEqual(0);
//     });

// });