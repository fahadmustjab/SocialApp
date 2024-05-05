import { AddReaction } from '@reaction/controllers/add-reaction';
import express, { Router } from 'express';
class ReactionRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reaction', AddReaction.prototype.post);



    return this.router;
  }


}

export const reactionRoute: ReactionRoute = new ReactionRoute();
