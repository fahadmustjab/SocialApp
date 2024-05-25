import { BaseQueue } from './base.queue';
import { imageWorker } from '@worker/image.worker';
import { IFileImageJobData } from '@image/interfaces/image.interface';

class ImageQueue extends BaseQueue {
  constructor() {
    super('imageQueue');
    this.processJob('addProfileImageToDB', 5, imageWorker.addProfileImageToDB);
    this.processJob('updateBgImageToDB', 5, imageWorker.updateBgImageToDB);
    this.processJob('addImageToDB', 5, imageWorker.addImageToDB);
    this.processJob('removeImageToDB', 5, imageWorker.removeImageToDB);



  }
  public addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
