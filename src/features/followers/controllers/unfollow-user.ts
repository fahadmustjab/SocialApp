import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerQueue } from '@service/queues/follower.queue';

const followerCache: FollowerCache = new FollowerCache();
export class RemoveFollower {
  public async removeFollower(req: Request, res: Response): Promise<void> {
    try {
      const { followeeId, followerId } = req.params;

      const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);
      const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowerFromCache(`following:${followerId}`, followeeId);

      const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followeeId}`, 'followersCount', -1);
      const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followingCount', -1);

      await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

      followerQueue.addFollowerJob('RemoveFollowerFromDB', { keyOne: followeeId, keyTwo: followerId });

      res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed User successfully' });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }


}
