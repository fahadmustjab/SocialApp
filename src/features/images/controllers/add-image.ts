import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { addImageSchema } from '@image/schemas/image';
import { UserCache } from '@service/redis/user.cache';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@socket/image';
import { imageQueue } from '@service/queues/image.queue';
import { Helpers } from '@global/helpers/helpers';
import { IBgUploadResponse } from '@image/interfaces/image.interface';

const userCache: UserCache = new UserCache();
export class Add {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const image = req.body.image;
    const result: UploadApiResponse = await uploads(image, `${req.currentUser!.userId}`, true, true) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File Upload: Error Occured. Try again');
    }
    const cachedUser: IUserDocument = await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'profilePicture', `${result.secure_url}`) as IUserDocument;
    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('addProfileImageToDB', {
      key: `${req.currentUser!.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      value: `${result.secure_url}`
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added Successfully', url: `${result.secure_url}` });

  }


  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image = req.body.image;
    const { version, publicId }: IBgUploadResponse = await Add.prototype.backgroundUpload(image);

    const updatePublicId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'bgImageId', publicId) as Promise<IUserDocument>;
    const updateBgVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'bgImageVersion', version) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all([updatePublicId, updateBgVersion]);
    socketIOImageObject.emit('update user', {
      userId: response[0],
      imgId: publicId,
      imgVersion: version.toString(),
    });
    imageQueue.addImageJob('updateBgImageToDB', {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: version.toString(),
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added Successfully', });

  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image);

    let version = '';
    let publicId = '';
    if (isDataURL) {
      const result: UploadApiResponse = await uploads(image,) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      const value = image.split('/');
      version = value[value.length - 2];
      publicId = value[value.length - 1];
    }
    return { version: version.replace(/v/g, ''), publicId };
  }


}
