import { getNotificationsService, NotificationsService } from "@/services/notifications/Notification.service";

type UseNotifications = {
    notificationsService: NotificationsService;
};

export const useNotifications = (): UseNotifications => {
    const notificationsService = getNotificationsService();
    return { notificationsService };
};
