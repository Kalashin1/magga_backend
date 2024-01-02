import { Notification } from "../entity/notification";
import { AppDataSource } from "../data-source";
import { ObjectId } from "mongodb";

export class NotificationService {
  async create(
    shortText: string,
    type: string,
    user_id: string,
    objectId?: string,
    subjectId?: string,
    fileUrl?: string
  ) {
    const notification = await AppDataSource.mongoManager.create(Notification, {
      shortText,
      type,
      user_id,
      isRead: false,
      fileUrl,
      objectId,
      subjectId,
    });
    this.saveNotification(notification);
    return notification;
  }

  async readNotification(notification_id: string) {
    const notification = await this.getNotificationById(notification_id);
    notification.isRead = true;
    await this.saveNotification(notification);
    const payload = await this.getUserNotifications(notification.user_id);
    return payload;
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
          $eq: user_id,
        },
        isRead: {
          $eq: false,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}

const notificationService = new NotificationService();

export default notificationService;
