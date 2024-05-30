import HTTP_STATUS from 'http-status-codes';
import { MessageCache } from '@service/redis/message.cache';
import { Request, Response } from 'express';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@service/db/message.service';
import mongoose from 'mongoose';

const messageCache: MessageCache = new MessageCache();
export class Get {
  public async conversationList(req: Request, res: Response) {
    let messages: IMessageData[] = [];
    const cachedList = await messageCache.getConversationsOfUser(`${req.currentUser?.userId}`);
    if (cachedList.length) {
      messages = cachedList;
    } else {
      messages = await chatService.getConversationListOfUser(new mongoose.Types.ObjectId(req.currentUser!.userId));
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User conversation List', messages });

  }

  public async chatMessages(req: Request, res: Response) {
    const { conversationId } = req.params;
    let messages: IMessageData[] = [];
    const cachedList = await messageCache.getChatMessageFromCache(conversationId);
    if (cachedList.length) {
      messages = cachedList;
    } else {
      messages = await chatService.getChatMessages(conversationId, { createdAt: 1 });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User chat Messages', messages });

  }
}
