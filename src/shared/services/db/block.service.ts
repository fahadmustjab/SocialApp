import { ServerError } from '@global/helpers/error-handler';
import { UserModel } from '@user/schema/user.schema';
import { PushOperator } from 'mongodb';
import mongoose from 'mongoose';

class BlockService {
  public async blockUser(userId: string, followerId: string): Promise<void> {
    try {
      await UserModel.bulkWrite([{
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(userId), blocked: { $ne: followerId } },
          update: { $push: { blocked: new mongoose.Types.ObjectId(followerId) } as PushOperator<Document> }
        }
      }, {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(followerId), blockedBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          update: { $push: { blockedBy: new mongoose.Types.ObjectId(userId) } }
        }
      }]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }

  public async unBlockUser(userId: string, followerId: string): Promise<void> {
    try {
      await UserModel.bulkWrite([{
        updateOne: {
          filter: { _id: userId, },
          update: { $pull: { blocked: new mongoose.Types.ObjectId(followerId) } as PushOperator<Document> }
        }
      }, {
        updateOne: {
          filter: { _id: followerId, },
          update: { $pull: { blockedBy: new mongoose.Types.ObjectId(userId) } }
        }
      }]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }

}
export const blockService: BlockService = new BlockService();
