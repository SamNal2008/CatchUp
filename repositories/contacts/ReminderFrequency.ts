import * as Notification from 'expo-notifications';

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

const getNextNotificationSecondsInterval = (frequency: ReminderFrequency): number => {

    const TO_SECONDS = 60; //60 * 60 * 24;

    const toSeconds = (dayNumber: number) => {
        return dayNumber * TO_SECONDS;
    };

    switch (frequency) {
        case 'daily':
            return toSeconds(1)
        case 'monthly':
            return toSeconds(30);
        case 'weekly':
            return toSeconds(7);
        case 'yearly':
            return toSeconds(365);
    }
};

export const ReminderFrequencyUtils = {
    translateFrequencyToEnglish,
    getNextNotificationSecondsInterval
}