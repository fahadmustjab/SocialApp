import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { addCommentSchema } from '@comment/schemas/comment';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { commentQueue } from '@service/queues/comment.queue';
import { CommentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

const commentCache: CommentCache = new CommentCache();
export class AddComment {
  @joiValidation(addCommentSchema)
  public async post(req: Request, res: Response) {
    const { userTo, postId, comment, profilePicture, } = req.body;
    try {
      const commentIdObject = new ObjectId();
      const commentData: ICommentJob = {
        postId,
        userTo,
        userFrom: `${req.currentUser!.userId}`,
        username: `${req.currentUser?.username}`,
        comment: {
          _id: commentIdObject,
          userTo,
          postId,
          username: `${req.currentUser?.username}`,
          avatarColor: `${req.currentUser!.avatarColor}`,
          profilePicture,
          comment,
          createdAt: new Date(),
        } as ICommentDocument,
      };
      await commentCache.saveCommentToCache(postId, commentData.comment);
      commentQueue.addCommentJob('addCommentToDB', commentData);
      res.status(201).send({ message: 'Comment added successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Server Error. Please Try Again' });
    }
  }
}
