import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema } from '@post/schemas/post.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { socketIOPostObject } from '@socket/post';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '@global/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class UpdatePost {
  @joiValidation(postSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost = {
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      profilePicture,
    } as IPostDocument;
    await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostFromDB', { key: postId, value: updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Post Updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async updatePostWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      UpdatePost.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await UpdatePost.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }
  private async updatePost(req: Request): Promise<void> {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost = {
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      profilePicture,
    } as IPostDocument;
    await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', updatedPost, 'posts');
    postQueue.addPostJob('updatePostFromDB', { key: postId, value: updatedPost });
  }
  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image, } = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse =
      ((await uploads(image)) as UploadApiResponse);
    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });

    return result;
  }

}
