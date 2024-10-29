export type ReminderFrequency = "weekly" | "monthly" | "yearly" | "daily";

const translateFrequencyToFrench = (frequency: ReminderFrequency): string => {
    switch (frequency) {
        case 'monthly':
            return 'un mois';
        case 'weekly':
            return 'une semaine';
        case 'yearly':
            return 'un an';
        case 'daily':
            return 'un jour'
    }
}

const getNextNotificationSecondsInterval = (frequency: ReminderFrequency): number => {

    const toSeconds = (dayNumber: number) => {
        return dayNumber;
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
    translateFrequencyToFrench,
    getNextNotificationSecondsInterval
}