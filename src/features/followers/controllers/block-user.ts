import { blockQueue } from '@service/queues/block.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const followerCache: FollowerCache = new FollowerCache();
export class BlockUser {
  public async block(req: Request, res: Response) {
    try {
      const { followerId } = req.params;
      BlockUser.prototype.blockUserInCache(followerId, req.currentUser!.userId, 'block');
      blockQueue.addBlockUnblockUserJob('addBlockUnBlockUserFromDB', { keyOne: `${req.currentUser!.userId}`, keyTwo: `${followerId}`, type: 'block' });

      res.status(HTTP_STATUS.OK).json({ message: 'User blocked successfully' });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  public async unBlock(req: Request, res: Response) {
    try {
      const { followerId } = req.params;
      BlockUser.prototype.blockUserInCache(followerId, req.currentUser!.userId, 'unblock');
      blockQueue.addBlockUnblockUserJob('removeBlockUnBlockUserFromDB', { keyOne: `${req.currentUser!.userId}`, keyTwo: `${followerId}`, type: 'unblock' });

      res.status(HTTP_STATUS.OK).json({ message: 'User UnBlocked successfully' });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  private async blockUserInCache(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    // Block user in cache
    const blocked: Promise<void> = followerCache.updateBlockedUserInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followerCache.updateBlockedUserInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);

  }
}
