import {
  NotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from "expo-notifications/src/Notifications.types";

type RandomHourInterval = {
  min: number;
  max: number;
};

export const getRandomBetween = (
  randomHourInterval: RandomHourInterval[],
): number => {
  const randomInterval =
    randomHourInterval[Math.floor(Math.random() * randomHourInterval.length)];
  return (
    Math.floor(Math.random() * (randomInterval.max - randomInterval.min + 1)) +
    randomInterval.min
  );
};

export const ReminderFrequencies = [
  "daily",
  "weekly",
  "bimonthly",
  "monthly",
  "quarterly",
  "biannually",
  "yearly",
  "never",
] as const;
export type ReminderFrequency = (typeof ReminderFrequencies)[number];
export type ReminderFrequencyWithoutNever = Exclude<ReminderFrequency, "never">;

const createReminderFrequencyOptions = (
  value: ReminderFrequency,
): { label: string; value: ReminderFrequency } => ({
  label: translateFrequencyToEnglishOptions(value),
  value,
});

const translateFrequencyToEnglishOptions = (
  frequency: ReminderFrequency,
): string => {
  switch (frequency) {
    case "daily":
      return "Every day";
    case "weekly":
      return "Every week";
    case "bimonthly":
      return "Every 2 weeks";
    case "monthly":
      return "Every month";
    case "quarterly":
      return "Every 3 months";
    case "biannually":
      return "Every 6 months";
    case "yearly":
      return "Every year";
    default:
      return "Never";
  }
};

export const reminderFrequencyOptionsWithTranslation = ReminderFrequencies.map(
  createReminderFrequencyOptions,
);

const translateFrequencyToEnglish = (frequency: ReminderFrequency): string => {
  switch (frequency) {
    case "monthly":
      return "1 month";
    case "weekly":
      return "7 days";
    case "yearly":
      return "1 year";
    case "daily":
      return "1 days";
    case "biannually":
      return "6 months";
    case "quarterly":
      return "3 months";
    case "bimonthly":
      return "2 weeks";
    default:
      return "never";
  }
};

const getWeekOfMonthOfToday = (checkinDate: Date): number => {
  const start = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), 1);
  const dayOfWeek = start.getDay();
  const dayOfCheckin = checkinDate.getDate() + 1;
  return Math.ceil((dayOfCheckin + dayOfWeek) / 7);
};

const getNextNotificationTrigger = (
  frequency: ReminderFrequencyWithoutNever,
  checkInDate: Date,
): NotificationTriggerInput => {
  const randomHour = getRandomBetween([
    { min: 8, max: 10 },
    { min: 12, max: 14 },
    { min: 18, max: 20 },
  ]);
  const randomMinute = getRandomBetween([{ min: 0, max: 59 }]);
  const baseTriggerInput: NotificationTriggerInput = {
    hour: randomHour,
    minute: randomMinute,
    channelId: "default",
    repeats: true,
    type: SchedulableTriggerInputTypes.CALENDAR,
  };
  console.log(baseTriggerInput);
  switch (frequency) {
    case "daily":
      return baseTriggerInput;
    case "weekly":
      return {
        ...baseTriggerInput,
        weekday: checkInDate.getDay() === 0 ? 7 : checkInDate.getDay(),
      };
    case "monthly":
      return {
        ...baseTriggerInput,
        weekOfMonth: getWeekOfMonthOfToday(checkInDate),
      };
    case "yearly":
      return {
        ...baseTriggerInput,
        month: (checkInDate.getMonth() + 1) % 12,
        day: checkInDate.getDate(),
      };
    case "bimonthly":
      return {
        ...baseTriggerInput,
        month: (checkInDate.getMonth() + 2) % 12,
        day: checkInDate.getDate(),
      };
    case "quarterly":
      return {
        ...baseTriggerInput,
        month: (checkInDate.getMonth() + 3) % 12,
        day: checkInDate.getDate(),
      };
    case "biannually":
      return {
        ...baseTriggerInput,
        month: (checkInDate.getMonth() + 6) % 12,
        day: checkInDate.getDate(),
      };
  }
};

export const ReminderFrequencyUtils = {
  translateFrequencyToEnglish,
  getNextNotificationTrigger,
  createReminderFrequencyOptions,
  translateFrequencyToEnglishOptions,
};
