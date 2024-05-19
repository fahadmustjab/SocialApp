import { ServerError } from '@global/helpers/error-handler';
import { follwerService } from '@service/db/follower.service';
import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class FollowerMiddleware {
  public async checkIfExists(req: Request, res: Response, next: NextFunction) {
    const { followerId } = req.params;

    try {
      const checkIfExists = await follwerService.checkIfFollowing(followerId, `${req.currentUser!.userId}`,);

      if (checkIfExists) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Already following this user' });
      }
    } catch (error) {
      throw new ServerError('Something went wrong. Please login again');
    }

    next();
  }

}
export const followerMiddleware = new FollowerMiddleware();
