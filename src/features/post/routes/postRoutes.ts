import { authMiddleware } from '@global/helpers/auth-middleware';
import { CreatePost } from '@post/controllers/create-post';
import { Delete } from '@post/controllers/delete-post';
import { GetPosts } from '@post/controllers/get-posts';
import express, { Router } from 'express';
class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, GetPosts.prototype.get);
    this.router.get('/post/image/:page', authMiddleware.checkAuthentication, GetPosts.prototype.getPostWithImages);

    this.router.post('/post', authMiddleware.checkAuthentication, CreatePost.prototype.post);
    this.router.post('/post/image', authMiddleware.checkAuthentication, CreatePost.prototype.postWithImage);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.delete);

    return this.router;
  }


}

export const postRoutes: PostRoutes = new PostRoutes();
