import { userCache } from '@auth/controllers/current-user';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { FollowerCache } from '@service/redis/follower.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
// import { ObjectId } from 'mongodb';
import { socketIOFollowerObject } from '@socket/follower';

const followerCache: FollowerCache = new FollowerCache();
export class AddFollower {
  public async addFollower(req: Request, res: Response): Promise<void> {
    try {
      const { followerId } = req.params;
      const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
      const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
      await Promise.all([followersCount, followeeCount]);

      const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${followerId}`) as Promise<IUserDocument>;
      const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;;
      const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);
      // const followerObjectId = new ObjectId();
      const addFollowerData: IFollowerData = AddFollower.prototype.userData(response[0]);
      //send data to client with socketIO
      socketIOFollowerObject.emit('add follower', addFollowerData);




      const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`${followerId}`, `${req.currentUser!.userId}`);
      const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`${req.currentUser!.userId}`, `${followerId}`);
      //send data to queue;
      await Promise.all([addFollowerToCache, addFolloweeToCache]);
      res.status(HTTP_STATUS.OK).json({ message: 'Follower added successfully' });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user


    };
  }
}
