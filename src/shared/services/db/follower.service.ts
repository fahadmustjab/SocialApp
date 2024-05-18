import { ServerError } from '@global/helpers/error-handler';
import mongoose, { ObjectId, Query } from 'mongoose';
import { FollowerModel } from '@follower/models/follower.schema';
import { UserModel } from '@user/schema/user.schema';
import { BulkWriteResult } from 'mongodb';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
class FollowerService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId): Promise<void> {
    try {
      const followerObjectId = new mongoose.Types.ObjectId(userId);
      const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
      await FollowerModel.create({ _id: followerDocumentId, followerId: followerObjectId, followeeId: followeeObjectId });
      const user: Promise<BulkWriteResult> = UserModel.bulkWrite([{
        updateOne: {
          filter: { _id: followerObjectId },
          update: { $inc: { followingCount: 1 } }
        }
      }, {
        updateOne: {
          filter: { _id: followeeObjectId },
          update: { $inc: { followersCount: 1 } }
        }
      }]);
      await Promise.all([user, UserModel.findOne({ _id: followeeId })]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }

  public async removeFollowerFromDB(followerId: string, followeeId: string,): Promise<void> {
    try {
      const followerObjectId = new mongoose.Types.ObjectId(followerId);
      const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
      const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({ followerId: followerObjectId, followeeId: followeeObjectId });
      const user: Promise<BulkWriteResult> = UserModel.bulkWrite([{
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      }, {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }]);
      await Promise.all([user, unfollow]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }

  public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    try {
      const followers: IFollowerData[] = await FollowerModel.aggregate([
        { $match: { followerId: userObjectId } },
        { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
        { $unwind: '$followeeId' },
        { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
        { $unwind: '$authId' },
        {
          $addFields: {
            _id: '$followeeId._id',
            uId: '$authId.uId',
            username: '$authId.username',
            profilePicture: '$followeeId.profilePicture',
            followersCount: '$followeeId.followersCount',
            followingCount: '$followeeId.followingCount',
            postCount: '$followeeId.postsCount',
            avatarColor: '$authId.avatarColor',
          },
        },
        {
          $project: {
            authId: 0,
            followeeId: 0,
            followerId: 0,
            __v: 0
          }
        }

      ]);
      return followers;

    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }

  }

  public async getFollowerData(userObjectId: mongoose.Types.ObjectId): Promise<IFollowerData[]> {
    try {
      const followers: IFollowerData[] = await FollowerModel.aggregate([
        { $match: { followerId: userObjectId } },
        { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
        { $unwind: '$followerId' },
        { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
        { $unwind: '$authId' },
        {
          $addFields: {
            _id: '$followerId._id',
            uId: '$authId.uId',
            username: '$authId.username',
            profilePicture: '$followerId.profilePicture',
            followersCount: '$followerId.followersCount',
            followingCount: '$followerId.followingCount',
            postCount: '$followerId.postsCount',
            avatarColor: '$authId.avatarColor',
          },
        },
        {
          $project: {
            authId: 0,
            followerId: 0,
            followeeId: 0,
            __v: 0
          }
        }

      ]);
      return followers;

    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }

  }

}

export const follwerService: FollowerService = new FollowerService();
