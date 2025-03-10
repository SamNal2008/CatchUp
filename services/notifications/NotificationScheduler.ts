import { logService } from "@/services/log.service";

/**
 * Calculates the number of days until the next occurrence of a birthday.
 *
 * @param birthDate The birth date to check
 * @returns The number of days until the next birthday, or -1 if the birth date is invalid
 */
export const getDaysUntilBirthday = (birthDate: Date | null): number => {
  if (
    !birthDate ||
    !(birthDate instanceof Date) ||
    isNaN(birthDate.getTime())
  ) {
    return -1;
  }

  try {
    const today = new Date();

    // Get current year
    const currentYear = today.getFullYear();

    // Create a date for this year's birthday
    const thisYearBirthday = new Date(
      currentYear,
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    // If birthday has already occurred this year, calculate for next year
    if (today > thisYearBirthday) {
      const nextYearBirthday = new Date(
        currentYear + 1,
        birthDate.getMonth(),
        birthDate.getDate(),
      );
      const diffTime = nextYearBirthday.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // If birthday is today or in the future this year
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    logService.error("Error calculating days until birthday", error);
    return -1;
  }
};

/**
 * Registers a notification to remind about a friend's upcoming birthday.
 *
 * @param contactId The ID of the contact
 * @param contactName The name of the contact
 * @param birthDate The birth date of the contact
 * @returns Promise that resolves to the notification ID, or null if registration failed
 */
export const registerBirthdayNotification = async (
  contactId: string,
  contactName: string,
  birthDate: Date | null,
): Promise<string | null> => {
  if (!birthDate) {
    return null;
  }

  // Implementation would integrate with a notification system
  // This is a placeholder for the actual implementation
  logService.info(`Registered birthday notification for ${contactName}`);

  return "notification-id-" + contactId;
};

/**
 * Registers a notification to remind about checking in with a friend.
 *
 * @param contactId The ID of the contact
 * @param contactName The name of the contact
 * @param frequency The reminder frequency
 * @param lastCheckIn The date of the last check-in
 * @returns Promise that resolves to the notification ID, or null if registration failed
 */
export const registerCheckInNotification = async (
  contactId: string,
  contactName: string,
  frequency: string,
  lastCheckIn: Date | null,
): Promise<string | null> => {
  if (!lastCheckIn) {
    return null;
  }

  // Implementation would integrate with a notification system
  // This is a placeholder for the actual implementation
  logService.info(
    `Registered check-in notification for ${contactName} with frequency ${frequency}`,
  );

  return "checkin-notification-id-" + contactId;
};
