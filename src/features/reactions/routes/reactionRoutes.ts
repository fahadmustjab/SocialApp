import { authMiddleware } from '@global/helpers/auth-middleware';
import { AddReaction } from '@reaction/controllers/add-reaction';
import { GetReactions } from '@reaction/controllers/get-reaction';
import { RemoveReaction } from '@reaction/controllers/remove-reaction';
import express, { Router } from 'express';
class ReactionRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/reaction/:postId', authMiddleware.checkAuthentication, GetReactions.prototype.get);
    this.router.get('/post/single/reaction/username/:username/:postId', authMiddleware.checkAuthentication, GetReactions.prototype.getSingleReactionByUsername);
    this.router.get('/reaction/username/:username', authMiddleware.checkAuthentication, GetReactions.prototype.getReactionsOfUser);


    this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReaction.prototype.post);

    this.router.delete('/post/reaction/:postId/:previousReaction', RemoveReaction.prototype.delete);



    return this.router;
  }


}

export const reactionRoute: ReactionRoute = new ReactionRoute();
