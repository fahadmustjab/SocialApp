import { userCache } from '@auth/controllers/current-user';
import { ServerError } from '@global/helpers/error-handler';
import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import Logger from 'bunyan';
import { config } from '@root/config';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers/helpers';
const log: Logger = config.createLogger('reactionService');

class ReactionService {
  public async create(reaction: IReactionJob): Promise<void> {
    try {
      const { postId, type, reactionObject, previousReaction, username, userTo } = reaction;
      let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
      if (previousReaction) {
        updatedReactionObject = omit(reactionObject, ['_id']);
      }
      log.info(`Adding ${type} reaction to post ${postId} by ${username}`);
      await Promise.all([
        userCache.getUserFromCache(`${userTo}`),
        ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
        PostModel.findOneAndUpdate({ _id: postId }, { $inc: { [`reactions.${previousReaction}`]: -1, [`reactions.${type}`]: 1 } }, { new: true })
      ]);
    } catch (error) {
      throw new ServerError(`Server Error. Please Try Again: ${error}`);
    }
  }
  public async remove(reactionData: IReactionJob): Promise<void> {
    try {
      const { postId, previousReaction, username } = reactionData;
      await Promise.all([
        ReactionModel.deleteOne({ postId, type: previousReaction, username }),
        PostModel.updateOne({ _id: postId }, { $inc: { [`reactions.${previousReaction}`]: -1 } }, { new: true })
      ]);
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    try {
      const reactions: IReactionDocument[] = await ReactionModel.aggregate([
        { $match: query },
        { $sort: sort }
      ]);
      return [reactions, reactions.length];
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  public async getSinglePostReactionsbyUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      const reactions: IReactionDocument[] = await ReactionModel.aggregate([
        { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } },
      ]);
      return reactions.length ? [reactions[0], 1] : [];
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }
  }
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[] | []> {
    try {
      const reactions: IReactionDocument[] = await ReactionModel.aggregate([
        { $match: { username: Helpers.firstLetterUppercase(username) } },
      ]);
      return reactions;
    } catch (error) {
      throw new ServerError('Server Error. Please Try Again');
    }

  }


}

export const reactionService: ReactionService = new ReactionService();
