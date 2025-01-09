import { ReminderFrequency } from "@/repositories/contacts/ReminderFrequency";
import * as Contact from "expo-contacts";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const NUMBER_OF_DAYS_IN = {
  ONE_MONTH: 30,
  ONE_WEEK: 7,
  ONE_YEAR: 365,
};

const INTERVAL_IN_MS = {
  ONE_DAY: ONE_DAY_IN_MS,
  ONE_WEEK: ONE_DAY_IN_MS * NUMBER_OF_DAYS_IN.ONE_WEEK,
  ONE_MONTH: ONE_DAY_IN_MS * NUMBER_OF_DAYS_IN.ONE_MONTH,
  ONE_YEAR: ONE_DAY_IN_MS * NUMBER_OF_DAYS_IN.ONE_YEAR,
};

const getDaysAgo = (days: number): Date =>
  new Date(new Date().getTime() - days * ONE_DAY_IN_MS);

const getDaysAgoFromFrequency = (frequency: ReminderFrequency): Date => {
  switch (frequency) {
    case "monthly":
      return getDaysAgo(NUMBER_OF_DAYS_IN.ONE_MONTH);
    case "weekly":
      return getDaysAgo(NUMBER_OF_DAYS_IN.ONE_WEEK);
    case "yearly":
      return getDaysAgo(NUMBER_OF_DAYS_IN.ONE_YEAR);
    default:
      throw new Error("Invalid frequency : " + frequency);
  }
};

const getDateToRelaunch = (frequency: ReminderFrequency): Date => {
  const today = new Date();
  switch (frequency) {
    case "monthly":
      return new Date(today.getTime() + INTERVAL_IN_MS.ONE_MONTH);
    case "weekly":
      return new Date(today.getTime() + INTERVAL_IN_MS.ONE_WEEK);
    case "yearly":
      return new Date(today.getTime() + INTERVAL_IN_MS.ONE_YEAR);
    default:
      throw new Error("Invalid frequency : " + frequency);
  }
};

const getDateFromContactDate = (contactDate: Contact.Date): Date => {
  const formattedDate =
    contactDate.year + "-" + contactDate.month + "-" + contactDate.day;
  return new Date(formattedDate);
};

const getBirthDateFromBirthday = (
  contact: Contact.Contact | null,
): Date | null => {
  if (!contact?.birthday) {
    return null;
  }
  return getDateFromContactDate(contact.birthday);
};

const fillWithZero = (number: number): string => {
  if (number < 10) {
    return "0" + number;
  }
  return number.toString();
};

const displayDateAsDDMMYYYY = (date: Date): string => {
  return (
    fillWithZero(date.getDate()) +
    "/" +
    fillWithZero(date.getMonth() + 1) +
    "/" +
    date.getFullYear()
  );
};

const getMonthName = (monthWithYear: string) => {
  const month = monthWithYear.split(" ")[0];
  switch (month) {
    case "0":
      return "January";
    case "1":
      return "February";
    case "2":
      return "March";
    case "3":
      return "April";
    case "4":
      return "May";
    case "5":
      return "June";
    case "6":
      return "July";
    case "7":
      return "August";
    case "8":
      return "September";
    case "9":
      return "October";
    case "10":
      return "November";
    case "11":
      return "December";
  }
};

export const DateUtils = {
  INTERVAL_IN_MS,
  NUMBER_OF_DAYS_IN,
  ONE_DAY_IN_MS,
  getDaysAgo,
  getDaysAgoFromFrequency,
  getDateToRelaunch,
  getDateFromContactDate,
  getBirthDateFromBirthday,
  getMonthName,
  displayDateAsDDMMYYYY,
};
