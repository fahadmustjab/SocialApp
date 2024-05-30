import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IChatList, IChatUsers, IMessageData } from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';
const log: Logger = config.createLogger('messageCache');
import _ from 'lodash';

export class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }
  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const list = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (list.length == 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const isExist = list.find((item) => JSON.parse(item).receiverId == receiverId);
        if (!isExist) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }

      }

    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      let chatUsers: IChatUsers[] = [];
      const isExistIndex = _.findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      if (isExistIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      let chatUsers: IChatUsers[] = [];
      const isExistIndex = _.findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      if (isExistIndex > -1) {
        await this.client.LREM('chatUsers', isExistIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  private async getChatUsersList(): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatUsers: IChatUsers[] = [];
      const response: string[] = await this.client.LRANGE('chatUsers', 0, -1);
      for (const item of response) {
        chatUsers.push(Helpers.parseJSON(item) as IChatUsers);
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  public async getConversationsOfUser(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatList: string[] = await this.client.LRANGE(`chatList${key}`, 0, -1);
      const chatConversationList: IMessageData[] = [];
      for (const chat of chatList) {
        const chatItem: IChatList = Helpers.parseJSON(chat) as IChatList;
        const lastMessage: string = await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1) as string;
        chatConversationList.push(Helpers.parseJSON(lastMessage));

      }
      return chatConversationList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async getChatMessageFromCache(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatMessages: IMessageData[] = [];
      const messages: string[] = await this.client.LRANGE(`messages:${key}`, 0, -1);
      for (const message of messages) {
        const messageData: IMessageData = Helpers.parseJSON(message) as IMessageData;
        chatMessages.push(messageData);
      }
      return chatMessages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async addChatMessageToSchema(conversationId: string, value: IMessageData) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(value));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

}

