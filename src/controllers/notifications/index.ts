import { Request, Response } from "express";
import { NotificationService } from "../../services/notifications";

const notificationService = new NotificationService()

export const getNotificationById = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const notification = notificationService.getNotificationById(id);
    return res.json(notification)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const getUserNotifications = async (req: Request, res: Response) => {
  const {user_id} = req.params;
  try {
    const notifications = await notificationService.getUserNotifications(user_id)
    return res.json(notifications);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const notification = await notificationService.readNotification(id);
    return res.json(notification);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  } 
}

export const readMultipleNotifications = async (req: Request, res: Response) => {
  const {user_id} = req.params;
  try {
    const notifications = await notificationService.markAllAsRead(user_id);
    return res.json(notifications);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}