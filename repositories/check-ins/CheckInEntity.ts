import { ContactId, ContactModel } from "@/repositories";

export type CheckInId = string;

export type CheckInEntity = {
  contact_id: ContactId;
  check_in_date: Date;
  note_content?: string;
};

export type CheckInModel = {
  contact: ContactModel;
  checkInDate: Date;
  noteContent?: string;
};
