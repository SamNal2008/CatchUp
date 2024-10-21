import { getNotificationsService, NotificationsService } from "@/services/notifications/Notification.service";
import { useEffect } from "react";

type UseNotifications = {
    notificationsService: NotificationsService;
};

export const useNotifications = (): UseNotifications => {
    const notificationsService = getNotificationsService();

    useEffect(() => {
        notificationsService.initializeNotificationsSettings();
        notificationsService.requestPermission();
        // notificationsService?.sendNotificationForContact({
        //     contactType: 'person',
        //     frequency: 'weekly',
        //     name: 'John Doe',
        //     firstName: 'John',
        // });
    }, []);

    return {notificationsService};
};
