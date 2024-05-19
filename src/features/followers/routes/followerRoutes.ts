import { BlockUser } from '@follower/controllers/block-user';
import { AddFollower } from '@follower/controllers/follower-user';
import { GetFollower } from '@follower/controllers/get-followers';
import { RemoveFollower } from '@follower/controllers/unfollow-user';
import { followerMiddleware } from '@follower/middlewares/follower.middleware';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
class FollowerRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/user/following', authMiddleware.checkAuthentication, GetFollower.prototype.userFollowing);
    this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, GetFollower.prototype.userFollowers);
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, followerMiddleware.checkIfExists, AddFollower.prototype.addFollower);
    this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.checkAuthentication, RemoveFollower.prototype.removeFollower);
    this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, BlockUser.prototype.block);
    this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, BlockUser.prototype.unBlock);

    return this.router;
  }


}

export const followerRoute: FollowerRoute = new FollowerRoute();
