import { AddFollower } from '@follower/controllers/follower-user';
import { RemoveFollower } from '@follower/controllers/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
class FollowerRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, AddFollower.prototype.addFollower);
    this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, RemoveFollower.prototype.removeFollower);


    return this.router;
  }


}

export const followerRoute: FollowerRoute = new FollowerRoute();
