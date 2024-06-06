import { IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addChatSchema } from '@chat/schemas/chat';
import mongoose from 'mongoose';
import { socketIOChatObject } from '@socket/chat';
import { notificationsTemplate } from '@service/emails/templates/notifications/notifications-template';
import { emailQueue } from '@service/queues/email.queue';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { MessageCache } from '@service/redis/message.cache';
import { chatQueue } from '@service/queues/chat.queue';

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response) {
    try {
      let fileUrl: string = '';
      const {
        conversationId,
        receiverId,
        receiverUsername,
        receiverAvatarColor,
        receiverProfilePicture,
        body,
        gifUrl,
        isRead,
        selectedImage,
      } = req.body;
      const messageObjectId: ObjectId = new ObjectId();
      const conversationObjectId = !conversationId ? new ObjectId() : new mongoose.Types.ObjectId(conversationId);

      const sender: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`) as IUserDocument;
      if (selectedImage.length) {
        const result: UploadApiResponse = await uploads(req.body.image, req.currentUser!.userId, true, true) as UploadApiResponse;
        if (!result?.public_id) {
          throw new BadRequestError(result.message);
        }
        fileUrl = result.secure_url;
      }
      const messageData: IMessageData = {
        _id: `${messageObjectId}`,
        conversationId: new mongoose.Types.ObjectId(conversationObjectId),
        senderId: `${req.currentUser!.userId}`,
        receiverId,
        senderUsername: `${sender.username}`,
        senderAvatarColor: `${sender.avatarColor}`,
        senderProfilePicture: `${sender.profilePicture}`,
        receiverUsername,
        receiverAvatarColor,
        receiverProfilePicture,
        body,
        gifUrl,
        isRead,
        selectedImage: fileUrl,
        reaction: [],
        createdAt: new Date(),
        deleteForMe: false,
        deleteForEveryone: false
      } as IMessageData;

      if (!isRead) {
        this.messageNotification({ currentUser: req.currentUser!, message: body, receiverName: receiverUsername, receiverId, messageData });
      }

      //add sender to chat list
      //add reciever to chat list
      await messageCache.addChatListToCache(`${req.currentUser!.userId}`, receiverId, `${conversationObjectId}`);
      await messageCache.addChatListToCache(receiverId, `${req.currentUser!.userId}`, `${conversationObjectId}`);
      //add message data to cache
      await messageCache.addChatMessageToSchema(`${conversationObjectId}`, messageData);
      //add message data to queue
      chatQueue.addChatJob('addMessageToDB', messageData);
      //socket events
      Add.prototype.emitSocketIOEvent(messageData);
      res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  public async addChatUsers(req: Request, res: Response) {
    const chatUsers = await messageCache.addChatUsersToCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users added', chatUsers });
  }

  public async removeChatUsers(req: Request, res: Response) {
    const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
    socketIOChatObject.emit('remove chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users removed', chatUsers });
  }

  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);

  }

  private async messageNotification({ currentUser, message, receiverName, receiverId, }: IMessageNotification): Promise<void> {
    const cachedReciever: IUserDocument = await userCache.getUserFromCache(`${receiverId}`) as IUserDocument;
    if (cachedReciever.notifications.messages) {
      const notificationTemplate: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message Notification from ${currentUser.username} `
      };
      const template: string = notificationsTemplate.notificationMessageTemplate(notificationTemplate);
      emailQueue.addEmailJob('directMessageEmail', { receiverEmail: currentUser.email, subject: `You have recieved  message from ${receiverName}`, template });
    }
  }

}
