import {NotificationTriggerInput} from "expo-notifications/src/Notifications.types";


type RandomHourInterval = {
    min: number;
    max: number;
}

export const getRandomBetween = (randomHourInterval: RandomHourInterval[]): number => {
    const randomInterval = randomHourInterval[Math.floor(Math.random() * randomHourInterval.length)];
    return Math.floor(Math.random() * (randomInterval.max - randomInterval.min + 1)) + randomInterval.min;
}

export type ReminderFrequency = "weekly" | "monthly" | "yearly" | "daily";

const translateFrequencyToEnglish = (frequency: ReminderFrequency): string => {
    switch (frequency) {
        case 'monthly':
            return '1 month';
        case 'weekly':
            return '7 days';
        case 'yearly':
            return '1 year';
        case 'daily':
            return '1 days'
    }
}

const getWeekOfMonthOfToday = (checkinDate: Date): number => {
    const start = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), 1);
    const dayOfWeek = start.getDay();
    const dayOfCheckin = checkinDate.getDate() + 1;
    return Math.ceil((dayOfCheckin + dayOfWeek) / 7);
}

const getNextNotificationTrigger = (frequency: ReminderFrequency, checkInDate: Date): NotificationTriggerInput => {
    const randomHour = getRandomBetween([{min: 8, max: 10}, {min: 12, max: 14}, {min: 18, max: 20}]);
    const randomMinute = getRandomBetween([{min: 0, max: 59}]);
    const baseTriggerInput = {
        hour: randomHour,
        minute: randomMinute,
        repeats: true,
        channelId: 'default'
    }
    switch (frequency) {
        case 'daily':
            return baseTriggerInput;
        case 'weekly':
            return {
                weekday: checkInDate.getDay() + 1,
                ...baseTriggerInput
            };
        case 'monthly':
            return {
                weekOfMonth: getWeekOfMonthOfToday(checkInDate),
                ...baseTriggerInput
            }
        case 'yearly':
            return {
                month: checkInDate.getMonth() + 1,
                day: checkInDate.getDate(),
                ...baseTriggerInput
            }
    }
};

export const ReminderFrequencyUtils = {
    translateFrequencyToEnglish,
    getNextNotificationTrigger
}