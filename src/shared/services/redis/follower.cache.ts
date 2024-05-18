import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';
const log: Logger = config.createLogger('followerCache');


export class FollowerCache extends BaseCache {
  constructor() {
    super('followerCache');
  }
  public async saveFollowerToCache(key: string, value: string): Promise<void> {

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);

    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }

  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  public async getFollowerInCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const followers: IFollowerData[] = [];
      for (const item of response) {
        const user: IUserDocument = await userService.getUserById(item);
        const data: IFollowerData = {
          _id: user._id,
          uId: user.uId,
          username: user.username,
          profilePicture: user.profilePicture,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          postCount: user.postsCount,
          avatarColor: user.avatarColor,
        } as IFollowerData;
        followers.push(data);
      }
      return followers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async updateFollowersCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server Error. Please Try Again');
    }
  }

}

