import { IFileImageDocument } from '@image/interfaces/image.interface';
import { ImageModel } from '@image/models/image.schema';
import { config } from '@root/config';
import { UserModel } from '@user/schema/user.schema';
import Logger from 'bunyan';

const log: Logger = config.createLogger('imageService');

class ImageService {
  public async addUserProfileToDB(userId: string, imgId: string, imgVersion: string, url: string): Promise<void> {
    try {
      await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
      await this.addImage(userId, imgId, imgVersion, 'profile');

    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async addBackgroundImage(userId: string, imgId: string, imgVersion: string,): Promise<void> {
    try {
      await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
      await this.addImage(userId, imgId, imgVersion, 'background');

    } catch (error) {
      log.error(error);
      throw error;
    }
  }



  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    try {
      log.info('Adding Image to DB', imgId, imgVersion, userId, type);
      await ImageModel.create({
        userId,
        bgImageId: type === 'background' ? imgId : '',
        bgImageVersion: type === 'background' ? imgVersion : '',
        imgId,
        imgVersion

      });
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async removeImageFromDB(imageId: string): Promise<void> {
    try {
      await ImageModel.deleteOne({ _id: imageId }).exec();
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async getImageByBgId(bgImageId: string): Promise<IFileImageDocument> {
    try {
      const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
      return image;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }


  public async getImages(userId: string): Promise<IFileImageDocument[]> {
    try {
      const images: IFileImageDocument[] = await ImageModel.aggregate([{ $match: { userId } }]).exec();
      return images;
    } catch (error) {
      log.error(error);
      throw error;
    }
  }
}

export const imageService: ImageService = new ImageService();
