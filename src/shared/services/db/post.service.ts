import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/schema/user.schema';
import Logger from 'bunyan';
import { UpdateQuery } from 'mongoose';

const log: Logger = config.createLogger('postService');
export class PostService {
  public async create(data: IPostDocument): Promise<void> {
    try {
      const post: Promise<IPostDocument> = PostModel.create(data);
      const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: data.userId }, { $inc: { postsCount: 1 } });
      await Promise.all([post, user]);
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

}
