import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { removeReactionSchema } from '@reaction/schemas/reactions';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { reactionQueue } from '@service/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();
export class RemoveReaction {
  @joiValidation(removeReactionSchema)
  public async delete(req: Request, res: Response) {
    const { postId, previousReaction } = req.params;
    const { postReactions } = req.body;
    await reactionCache.removeReactionFromCache(postId, `${req.currentUser!.username}`, postReactions);
    const databaseReaction = {
      postId,
      previousReaction,
      username: `${req.currentUser!.username}`
    } as IReactionJob;

    reactionQueue.addReactionJob('removeReactionFromDB', databaseReaction);


    res.status(HTTP_STATUS.OK).json({ message: 'Removed Reaction' });
  }
}
