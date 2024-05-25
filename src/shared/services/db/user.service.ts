import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/schema/user.schema';
import Logger from 'bunyan';
import mongoose from 'mongoose';


const log: Logger = config.createLogger('userService');
export class UserService {

  public async createUser(data: IUserDocument): Promise<IUserDocument> {
    try {
      return await UserModel.create(data);
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async getUserById(id: string): Promise<IUserDocument> {
    try {
      const [users] = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
        { $unwind: '$authId' },
        { $project: this.aggregateProject() }
      ]);
      return users;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }
  public async deleteBgImageFromDB(userId: string): Promise<void> {
    try {
      await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: '', bgImageVersion: '' } }).exec();

    } catch (error) {
      log.error(error);
      throw error;
    }
  }
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    try {
      const [users] = await UserModel.aggregate([
        { $match: { authId: new mongoose.Types.ObjectId(authId) } },
        { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
        { $unwind: '$authId' },
        { $project: this.aggregateProject() }
      ]);
      return users;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }
  private aggregateProject() {
    return {
      _id: 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}


export const userService = new UserService();
