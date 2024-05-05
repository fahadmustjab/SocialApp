import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IReactions, IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@global/helpers/helpers';
import _ from 'lodash';
const log: Logger = config.createLogger('reactionCache');


export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }
  public async saveReactionToCache(key: string,
    reaction: IReactionDocument,
    type: string,
    previousReaction: string,
    postReactions: IReactions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        await this.removeReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
      }

    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async removeReactionFromCache(key: string, username: string, postReactions: IReactions): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
    const multi: ReturnType<typeof this.client.multi> = this.client.multi();
    const userPreviousReactions: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;
    await this.client.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReactions));
    await multi.exec();
    await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
  }
  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJSON(item) as IReactionDocument);
    }
    return _.find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}

