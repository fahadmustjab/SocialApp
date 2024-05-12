import { ServerError } from '@global/helpers/error-handler';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '../redis/user.cache';
const userCache = new UserCache();
class CommentService {
  public async create(commentData: ICommentJob): Promise<void> {
    try {
      const { comment, postId, userTo } = commentData;
      const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
      const posts = PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }, { new: true });
      const user = userCache.getUserFromCache(userTo);
      await Promise.all([posts, comments, user]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }




  public async getCommentsOfPost(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    try {
      const comments: ICommentDocument[] = await CommentsModel.aggregate([
        { $match: query },
        { $sort: sort }
      ]);
      return comments;
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }

  }



  public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    try {
      const comments: ICommentNameList[] = await CommentsModel.aggregate([
        { $match: query },
        { $sort: sort },
        { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);
      return comments;

    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }

  }


}

export const commentsService: CommentService = new CommentService();
