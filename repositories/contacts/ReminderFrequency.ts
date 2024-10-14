export type ReminderFrequency = "weekly" | "monthly" | "yearly";

const translateFrequencyToFrench = (frequency: ReminderFrequency): string => {
    switch (frequency) {
        case 'monthly':
            return 'un mois';
        case 'weekly':
            return 'une semaine';
        case 'yearly':
            return 'un an';
    }
}

export const ReminderFrequencyUtils = {
    translateFrequencyToFrench,
    
}