import { ObjectId } from 'mongodb';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { addReactionSchema } from '@reaction/schemas/reactions';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { reactionQueue } from '@service/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();
export class AddReaction {
  @joiValidation(addReactionSchema)
  public async post(req: Request, res: Response) {
    const { userTo, postId, type, profilePicture, previousReaction, postReactions } = req.body;
    const reactionsObject: IReactionDocument = {
      _id: new ObjectId(),
      type,
      postId,
      profilePicture,
      username: req.currentUser!.username,
      avataColor: req.currentUser!.avatarColor,
    } as IReactionDocument;
    await reactionCache.saveReactionToCache(postId, reactionsObject, type, previousReaction, postReactions);
    const dataBaseReaction: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      userFrom: req.currentUser!.userId,
      previousReaction,
      userTo,
      type,
      reactionObject: reactionsObject,
    };

    reactionQueue.addReactionJob('addReactionToDB', dataBaseReaction);
    res.status(HTTP_STATUS.OK).json({ message: 'Added Reaction' });
  }
}
