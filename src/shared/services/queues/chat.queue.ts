import { BaseQueue } from './base.queue';
import { chatWorker } from '@worker/message.worker';
import { IMessageData } from '@chat/interfaces/chat.interface';

class ChatQueue extends BaseQueue {
  constructor() {
    super('authQueue');
    this.processJob('addMessageToDB', 5, chatWorker.addMessageToDB);
  }
  public addChatJob(name: string, data: IMessageData): void {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
