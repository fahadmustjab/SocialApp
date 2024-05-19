import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { notificationService } from '@service/db/notification.service';

const log: Logger = config.createLogger('notificationWorker');
class NotificationWorker {
  async updateNotificationToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;

      await notificationService.updateNotificationToRead(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletNotificationInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data;

      await notificationService.deleteNotificationById(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
