import { reactionService } from '@service/db/reaction.service';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';

const reactionCache = new ReactionCache();
export class GetReactions {
  public async get(req: Request, response: Response) {
    const { postId } = req.params;
    const cacheReactions = await reactionCache.getReactionsFromCache(postId);
    const [reactions, reactionCount] = cacheReactions[1] ? cacheReactions : await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: 1 });

    return response.status(HTTP_STATUS.OK).json({ message: 'Post Reactions', reactions, reactionCount });
  }

  public async getSingleReactionByUsername(req: Request, response: Response) {
    const { postId, username } = req.params;
    const cacheReactions = await reactionCache.getSingleReactionOfUser(postId, username);
    const [reaction, reactionCount] = cacheReactions[1] ? cacheReactions : await reactionService.getSinglePostReactionsbyUsername(postId, username);
    return response.status(HTTP_STATUS.OK).json({ message: 'Post Reactions', reaction, reactionCount });
  }

  public async getReactionsOfUser(req: Request, response: Response) {
    const { username } = req.params;
    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);
    return response.status(HTTP_STATUS.OK).json({ message: 'Reactions', reactions });

  }
}
