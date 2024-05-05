import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemas/post.schema';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const postCache: PostCache = new PostCache();
export class CreatePost {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response) {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture } = req.body;
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      reactions: {
        like: 0,
        love: 0,
        happy: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      createdAt: new Date()
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({ key: postObjectId, currentUserId: req.currentUser!.userId, uId: req.currentUser!.uId, createdPost });
    postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Post created successfully', });

  }
  @joiValidation(postSchema)
  public async postWithImage(req: Request, res: Response) {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture, image } = req.body;

    const result: UploadApiResponse = await uploads(image) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result?.message);
    }



    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount: 0,
      imgVersion: `${result.version}`,
      imgId: result?.public_id,
      reactions: {
        like: 0,
        love: 0,
        happy: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      createdAt: new Date()
    } as IPostDocument;
    socketIOPostObject.emit('add post', createdPost);
    await postCache.savePostToCache({ key: postObjectId, currentUserId: req.currentUser!.userId, uId: req.currentUser!.uId, createdPost });
    postQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
    //call image queue to add to the database
    res.status(HTTP_STATUS.OK).json({ message: 'Post created successfully', });

  }
}

