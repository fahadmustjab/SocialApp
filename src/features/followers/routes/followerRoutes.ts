import { AddFollower } from '@follower/controllers/follower-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
class FollowerRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/user/follow/:followerId', authMiddleware.checkAuthentication, AddFollower.prototype.addFollower);


    return this.router;
  }


}

export const followerRoute: FollowerRoute = new FollowerRoute();
