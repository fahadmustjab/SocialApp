import Logger from 'bunyan';
import { config } from '@root/config';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ServiceError } from '@global/helpers/error-handler';
import { ConversationModel } from '@chat/models/conversation.schema';
import mongoose from 'mongoose';
const log: Logger = config.createLogger('ChatService');

class ChatService {

  public async addChatMessage(value: IMessageData): Promise<void> {
    try {
      const {
        conversationId,
        senderId,
        receiverId,
      } = value;
      const conversation = await ConversationModel.find({ _id: conversationId }).exec();
      if (conversation.length === 0) {
        await ConversationModel.create({
          _id: conversationId,
          senderId, receiverId
        });
      }

      await MessageModel.create(value);
    } catch (error) {
      log.error(error);
      throw new ServiceError('Server Error. Please Try Again');
    }
  }

  public async getConversationListOfUser(userId: mongoose.Types.ObjectId) {
    try {
      const messages: IMessageData[] = await MessageModel.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        {
          $group: {
            _id: '$conversationId',
            result: { $last: '$$ROOT' }
          }
        },
        {
          $project: this.aggregateProject()
        },
        {
          $sort: { createdAt: 1 }
        }
      ]);
      return messages;
    } catch (error) {
      log.error(error);
      throw new ServiceError('Server Error. Please Try Again');
    }
  }
  public async getChatMessages(conversationId: string, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
    try {
      const query = { conversationId: new mongoose.Types.ObjectId(conversationId) };
      const messages: IMessageData[] = await MessageModel.aggregate([
        { $match: query }, { $sort: sort }
      ]);
      return messages;
    } catch (error) {
      log.error(error);
      throw new ServiceError('Server Error. Please Try Again');
    }
  }
  private aggregateProject() {
    return {
      _id: '$result._id',
      conversationId: '$result.conversationId',
      senderId: '$result.senderId',
      receiverId: '$result.receiverId',
      senderUsername: '$result.senderUsername',
      senderAvatarColor: '$result.senderAvatarColor',
      senderProfilePicture: '$result.senderProfilePicture',
      receiverUsername: '$result.receiverUsername',
      receiverAvatarColor: '$result.receiverAvatarColor',
      receiverProfilePicture: '$result.receiverProfilePicture',
      body: '$result.body',
      gifUrl: '$result.gifUrl',
      isRead: '$result.isRead',
      selectedImage: '$result.selectedImage',
      reaction: '$result.reaction',
      createdAt: '$result.createdAt',
      deleteForMe: '$result.deleteForMe',
      deleteForEveryone: '$result.deleteForEveryone',
    };
  }
}

export const chatService: ChatService = new ChatService();
