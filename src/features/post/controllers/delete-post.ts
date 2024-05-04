import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { socketIOPostObject } from '@socket/post';

const postCache: PostCache = new PostCache();

export class Delete {
  public async delete(req: Request, res: Response): Promise<void> {
    console.log('delete post', req.params.postId);
    socketIOPostObject.emit('delete post', req.params.postId);
    await postCache.deletePostsFromCache(req.params.postId, `${req.currentUser!.userId}`);
    postQueue.addPostJob('deletePostFromDB', { key: req.params.postId, });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
