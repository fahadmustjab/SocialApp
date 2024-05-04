import { IGetPostsQuery, IPostDocument } from '@post/interfaces/post.interface';
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
  public async delete(postId: string): Promise<void> {
    const post: IPostDocument | null = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    const user = UserModel.updateOne({ _id: post.userId }, { $inc: { postsCount: -1 } });
    const deletePost = PostModel.deleteOne({ _id: postId });
    await Promise.all([deletePost, user]);

  }


  public async getPosts(query: IGetPostsQuery, skip: number, limit: number, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    try {
      let postsQuery = {};
      if (query.gifUrl && query.imgId) {
        postsQuery = {
          $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }]
        };
      }
      const posts: IPostDocument[] = await PostModel.aggregate([
        { $match: postsQuery },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ]);
      return posts;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async postsCount(): Promise<number> {
    try {
      const count: number = await PostModel.countDocuments({});
      return count;
    } catch (error) {
      log.error(error);
      throw error;
    }

  }


}

export const postService: PostService = new PostService();
