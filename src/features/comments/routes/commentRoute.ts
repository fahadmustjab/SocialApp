import { AddComment } from '@comment/controllers/add-comment';
import { GetComment } from '@comment/controllers/get-comment';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
class CommentRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, GetComment.prototype.getComments);
    this.router.get('/post/comment-names/:postId', authMiddleware.checkAuthentication, GetComment.prototype.getCommentNames);
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, GetComment.prototype.getSingleComment);

    this.router.post('/post/comment', authMiddleware.checkAuthentication, AddComment.prototype.post);

    return this.router;
  }


}

export const commentRoute: CommentRoute = new CommentRoute();
