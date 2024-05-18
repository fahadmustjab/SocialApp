import { INotification, INotificationDocument } from '@notification/interfaces/notification.interface';
import { config } from '@root/config';
import { notificationService } from '@service/db/notification.service';
import Logger from 'bunyan';
import mongoose, { Model, Schema, } from 'mongoose';
const log: Logger = config.createLogger('notificationSchema');


const notificationSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  userTo: { type: String, index: true, ref: 'User' },
  userFrom: { type: String, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: { type: String, },
  entityId: { type: Schema.Types.ObjectId, },
  createdItemId: { type: Schema.Types.ObjectId, },
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
  } = body;
  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
  });
  try {
    const notifications = await notificationService.getNotification(userTo);
    return notifications;
  } catch (error) {
    log.error(error);
    return error;
  }
};

const NotificationModel: Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema, 'Notification');
export { NotificationModel };
