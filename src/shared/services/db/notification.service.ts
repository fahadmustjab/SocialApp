import { ServerError } from '@global/helpers/error-handler';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { config } from '@root/config';
import Logger from 'bunyan';
import mongoose from 'mongoose';

const log: Logger = config.createLogger('notificationService');


class NotificationService {
  public async getNotification(userId: string,): Promise<INotificationDocument[]> {
    try {
      return await NotificationModel.aggregate([
        { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
        { $unwind: '$userFrom' },
        { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'authId' } },
        { $unwind: '$authId' },
        { $project: this.aggregateProject() }
      ]);
    } catch (error) {
      log.error(error);
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }
  //update notification to read
  public async updateNotificationToRead(notificationId: string): Promise<void> {
    try {
      await NotificationModel.updateOne({ _id: new mongoose.Types.ObjectId(notificationId) }, { $set: { read: true } }).exec();
    } catch (error) {
      log.error(error);
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }
  //delete notification by id
  public async deleteNotificationById(notificationId: string): Promise<void> {
    try {
      await NotificationModel.deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) }).exec();
    } catch (error) {
      log.error(error);
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }

  private aggregateProject() {
    return {
      _id: 1,
      userTo: 1,
      message: 1,
      notificationType: 1,
      entityId: 1,
      createdItemId: 1,
      comment: 1,
      reaction: 1,
      post: 1,
      imgId: 1,
      imgVersion: 1,
      gifUrl: 1,
      read: 1,
      createdAt: 1,
      userFrom: {
        username: '$authId.username',
        uId: '$authId.uId',
        avatarColor: '$authId.avatarColor',
        profiliePicture: '$userFrom.profilePicture',
      }
    };
  }



}
export const notificationService: NotificationService = new NotificationService();
