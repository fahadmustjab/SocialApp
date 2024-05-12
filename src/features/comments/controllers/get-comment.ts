import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { commentsService } from '@service/db/comment.service';
import { CommentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';


const commentCache: CommentCache = new CommentCache();
export class GetComment {
  public async getComments(req: Request, res: Response) {
    const { postId } = req.params;
    try {
      const cachedComments: ICommentDocument[] = await commentCache.getCommentsOfPostFromCache(postId);
      const comments: ICommentDocument[] = cachedComments.length ? cachedComments : await commentsService.getCommentsOfPost({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

      res.status(HTTP_STATUS.OK).send({ message: 'Post Comments', comments });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Server Error. Please Try Again', error });
    }
  }

  public async getCommentNames(req: Request, res: Response) {
    const { postId } = req.params;
    try {
      const cachedComments: ICommentNameList[] = await commentCache.getCommentNamesFromCache(postId);
      const comments: ICommentNameList[] = cachedComments.length ? cachedComments : await commentsService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

      res.status(HTTP_STATUS.OK).send({ message: 'Post Comments names', comments });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Server Error. Please Try Again', error });
    }
  }

  public async getSingleComment(req: Request, res: Response) {
    const { postId, commentId } = req.params;
    try {
      const cachedComments: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
      const [comment]: ICommentDocument[] = cachedComments.length ? cachedComments : await commentsService.getCommentsOfPost({ _id: new mongoose.Types.ObjectId(commentId) },
        { createdAt: -1 });

      res.status(HTTP_STATUS.OK).send({ message: 'Single Comment', comment });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Server Error. Please Try Again', error });
    }
  }
}
