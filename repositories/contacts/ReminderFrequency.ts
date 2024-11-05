import {getRandomBetween} from "@/services/notifications/LocalNotifications.service";
import {NotificationTriggerInput} from "expo-notifications/src/Notifications.types";

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

const getWeekOfMonthOfToday = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfWeek = start.getDay();
    const today = now.getDate();
    return Math.ceil((today + dayOfWeek) / 7);
}

const getNextNotificationTrigger = (frequency: ReminderFrequency): NotificationTriggerInput => {
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
                weekday: new Date().getDay(),
                ...baseTriggerInput
            };
        case 'monthly':
            return {
                weekOfMonth: getWeekOfMonthOfToday(),
                ...baseTriggerInput
            }
        case 'yearly':
            return {
                month: new Date().getMonth() + 1,
                day: new Date().getDate(),
                ...baseTriggerInput
            }
    }
};

export const ReminderFrequencyUtils = {
    translateFrequencyToEnglish,
    getNextNotificationTrigger
}