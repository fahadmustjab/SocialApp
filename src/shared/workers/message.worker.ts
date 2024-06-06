import { config } from '@root/config';
import { chatService } from '@service/db/message.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('chatWorker');
class ChatWorker {
  async addMessageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;

      await chatService.addChatMessage(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
