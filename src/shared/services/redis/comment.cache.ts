import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
const log: Logger = config.createLogger('commentCache');


export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async saveCommentToCache(key: string,
    comment: ICommentDocument,): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${key}`, JSON.stringify(comment));
      const reply: string[] = await this.client.HMGET(`posts:${key}`, 'commentsCount');
      let commentCount: number = parseInt(reply[0]);
      commentCount = commentCount + 1;
      await this.client.HSET(`posts:${key}`, 'commentsCount', JSON.stringify(commentCount));

    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }




  public async getCommentsOfPostFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const reply of response) {
        list.push(Helpers.parseJSON(reply));
      }
      return list;

    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  public async getCommentNamesFromCache(key: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.LLEN(`comments:${key}`);
      const comments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: string[] = [];
      for (const reply of comments) {
        const comment: ICommentDocument = Helpers.parseJSON(reply);
        list.push(comment.username);
      }

      const response: ICommentNameList = {
        count: count,
        names: list
      };
      return [response];
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async deleteCommentFromCache(key: string, commentId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(`comments:${key}`, 0, commentId);
      const reply: string[] = await this.client.HMGET(`posts:${key}`, 'commentsCount');
      const commentCount: number = parseInt(reply[0]);
      await this.client.HSET(`posts:${key}`, 'commentsCount', commentCount - 1);

    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async updateCommentInCache(key: string, commentId: string, comment: ICommentDocument): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const reply of response) {
        list.push(Helpers.parseJSON(reply));
      }
      const index: number = list.findIndex((comment: ICommentDocument) => comment._id === commentId);
      if (index !== -1) {
        list[index] = comment;
        await this.client.DEL(`comments:${key}`);
        for (const comment of list) {
          await this.client.LPUSH(`comments:${key}`, JSON.stringify(comment));
        }
      }
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }


  public async getSingleCommentFromCache(key: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const reply of response) {
        list.push(Helpers.parseJSON(reply));
      }
      const comment: ICommentDocument = list.find((comment: ICommentDocument) => comment._id === commentId) as ICommentDocument;
      return [comment];

    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }

}

