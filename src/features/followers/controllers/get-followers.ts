import { IFollowerData } from '@follower/interfaces/follower.interface';
import { follwerService } from '@service/db/follower.service';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

const followerCache: FollowerCache = new FollowerCache();
export class GetFollower {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);

      const cachedFollowing = await followerCache.getFollowerInCache(`following:${req.currentUser!.userId}`);
      const following: IFollowerData[] = Object.keys(cachedFollowing).length > 0 ? cachedFollowing : await follwerService.getFollowerData(userObjectId);

      res.status(HTTP_STATUS.OK).json({ message: 'User Following', following });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const cachedFollowers = await followerCache.getFollowerInCache(`followers:${userId}`);
      const followers: IFollowerData[] = Object.keys(cachedFollowers).length > 0 ? cachedFollowers : await follwerService.getFollowerData(userObjectId);

      res.status(HTTP_STATUS.OK).json({ message: 'User Followers', followers });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }



}
