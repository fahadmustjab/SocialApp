import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
export const userCache: UserCache = new UserCache();

const log: Logger = config.createLogger('currentUser');

export class CurrentUser {
  public async read(req: Request, res: Response,): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    log.info('CachedUser', Object.keys(cachedUser).length !== 0);
    const existingUser: IUserDocument = Object.keys(cachedUser).length !== 0 ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });



  }
}
