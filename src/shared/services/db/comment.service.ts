import { ServerError } from '@global/helpers/error-handler';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '../redis/user.cache';
import { IPostDocument } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import mongoose, { Query } from 'mongoose';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { socketIONotificationObject } from '@socket/notification';
import { notificationsTemplate } from '@service/emails/templates/notifications/notifications-template';
import { emailQueue } from '@service/queues/email.queue';
const userCache = new UserCache();
class CommentService {
  public async create(commentData: ICommentJob): Promise<void> {
    try {
      const { comment, postId, userFrom, userTo, username } = commentData;
      const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
      const posts: Query<IPostDocument, IPostDocument> = PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }, { new: true }) as Query<IPostDocument, IPostDocument>;
      const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
      const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, posts, user]);
      if (response[2].notifications.comments && userFrom !== userTo) {
        const notificationModel: INotificationDocument = new NotificationModel();
        const notifications = notificationModel.insertNotification({
          userFrom,
          userTo,
          message: `${username} commented on your post.`,
          notificationType: 'comment',
          entityId: new mongoose.Types.ObjectId(postId),
          createdItemId: new mongoose.Types.ObjectId(response[0]._id),
          createdAt: new Date(),
          comment: comment.comment,
          post: response[1].post,
          imgVersion: response[1].imgVersion!,
          gifUrl: response[1].gifUrl!,
          imgId: response[1].imgId!,
          reaction: ''
        });
        //send to client with socketIo
        socketIONotificationObject.emit('insert notification', notifications, { userTo });
        //send email job
        const notificationTemplate: INotificationTemplate = {
          username: response[2].username!,
          message: `${username} commented on your post.`,
          header: 'Comment Notification'
        };
        const template: string = notificationsTemplate.notificationMessageTemplate(notificationTemplate);
        emailQueue.addEmailJob('commentsEmail', { receiverEmail: response[2].email!, subject: 'Post notifications', template });
      }
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
