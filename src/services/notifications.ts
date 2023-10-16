import { Notification } from "../entity/notification";
import { AppDataSource } from "../data-source";
import userService from "./user";
import { ObjectId } from "mongodb";

export class NotificationService {
  async create(shortText: string, type: string, user_id: string) {
    const user = await userService.getUser({ _id: user_id });
    if (!user) throw Error("user with that Id not found");
    const notification = await AppDataSource.mongoManager.create(Notification, {
      shortText,
      type,
      user_id,
      isRead: false,
    });
    this.saveNotification(notification);
    return notification;
  }

  async readNotification(notification_id: string) {
    const notification = await this.getNotificationById(notification_id);
    notification.isRead = true;
    await this.saveNotification(notification);
    return notification;
  }

  async markAllAsRead(user_id: string) {
    const notifications = await AppDataSource.mongoManager.find(Notification, {
      where: {
        user_id,
        isRead: false,
      },
    });
    notifications.forEach(async (notification) => {
      notification.isRead = true;
      await this.saveNotification(notification);
    });
    return notifications;
  }

  async saveNotification(notification: Notification) {
    return await AppDataSource.mongoManager.save(Notification, notification);
  }

  async getNotificationById(id: string) {
    return await AppDataSource.mongoManager.findOne(Notification, {
      where: {
        _id: new ObjectId(id),
      },
    });
  }

  getUserNotifications(user_id: string) {
    return AppDataSource.mongoManager.find(Notification, {
      where: {
        user_id: {
          $eq: user_id
        },
        isRead: {
          $eq: false
        }
      }
    })
  }
}
