import { ContactId } from "../contacts/ContactEntity";

export type CheckInEntity = {
    contact_id: ContactId;
    check_in_date: Date;
}