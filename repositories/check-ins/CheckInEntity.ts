import {ContactId, ContactModel} from "../contacts/ContactEntity";
import {Date} from "expo-contacts";

export type CheckInId = string;

export type CheckInEntity = {
    contact_id: ContactId;
    check_in_date: Date;
}

export type CheckInWithNoteEntity = {
    check_in_id: CheckInId;
    noteContent: string;
}

export type CheckInModel = {
    contact: ContactModel,
    checkInDate: Date,
    noteContent?: string,
}