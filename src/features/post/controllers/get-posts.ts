import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import { PostCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;
export class GetPosts {
  public async get(req: Request, res: Response) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const cachedPosts: IPostDocument[] = await postCache.getPostFromCache('post', newSkip, limit);
    let totalPosts = 0;
    let posts = [];
    if (!cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsFromCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({ posts, totalPosts });
  }

  public async getPostWithImages(req: Request, res: Response) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page, 10);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    let totalPosts = 0;
    let posts = [];
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsFromCache();
    } else {
      posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({ posts, totalPosts });
  }
}
