import { BaseQueue } from './base.queue';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { notificationWorker } from '@worker/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notificationQueue');
    this.processJob('updateNotificationToDB', 5, notificationWorker.updateNotificationToDB);
    this.processJob('deletNotificationInDB', 5, notificationWorker.deletNotificationInDB);
  }
  public addNotificationJob(name: string, data: INotificationJobData): void {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
