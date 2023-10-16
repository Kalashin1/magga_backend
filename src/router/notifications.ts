import { Router } from "express";
import {getNotificationById, getUserNotifications, markNotificationAsRead, readMultipleNotifications} from '../controllers/notifications/index'
import { NOTIFICATION_ROUTES } from "./routes";

const router = Router()

router.get(NOTIFICATION_ROUTES.NOTIFICATION, getNotificationById);
router.get(NOTIFICATION_ROUTES.USER_NOTIFICATION, getUserNotifications);
router.patch(NOTIFICATION_ROUTES.NOTIFICATION, markNotificationAsRead);
router.patch(NOTIFICATION_ROUTES.USER_NOTIFICATION, readMultipleNotifications);

export default router;
