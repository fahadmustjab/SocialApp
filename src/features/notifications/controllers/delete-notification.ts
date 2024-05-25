import { Request, Response } from 'express';
import { notificationQueue } from '@service/queues/notification.queue';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import HTTP_STATUS from 'http-status-codes';
import { socketIONotificationObject } from '@socket/notification';

export class DeleteNotification {

  public async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.body;
      const data: INotificationJobData = { key: notificationId };
      socketIONotificationObject.emit('delete notification', notificationId);
      notificationQueue.addNotificationJob('deletNotificationInDB', data);

      res.status(HTTP_STATUS.OK).send('Notification deleted');
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  }
}
