import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { Helpers } from '@global/helpers/helpers';
import { IReactions } from '@reaction/interfaces/reaction.interface';
const log: Logger = config.createLogger('postCache');
export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];


export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      commentsCount,
      imgVersion,
      imgId,
      feelings,
      gifUrl,
      privacy,
      reactions,
      createdAt
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'gifUrl',
      `${gifUrl}`,
      'privacy',
      `${privacy}`,
    ];
    const secondList: string[] = [
      'reactions',
      `${JSON.stringify(reactions)}`,
      'commentsCount',
      `${commentsCount}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];

    const dataToSave = [...firstList, ...secondList,];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postsCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, dataToSave);
      const count = parseInt(postsCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', `${count}`]);

      await multi.exec();


    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }

  }

  public async getPostFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const posts: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      posts.forEach((post: string) => {
        multi.HGETALL(`posts:${post}`);
      });

      const result: PostCacheMultiType = await multi.exec() as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of result as IPostDocument[]) {
        post.commentsCount = Helpers.parseJSON(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJSON(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJSON(`${post.createdAt}`));
        postReplies.push(post);
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }
}


