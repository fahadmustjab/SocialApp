import { authRoutes } from '@auth/routes/authRoutes';
import { currentRoutes } from '@auth/routes/currentRoutes';
import { commentRoute } from '@comment/routes/commentRoute';
import { followerRoute } from '@follower/routes/followerRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
<<<<<<< Updated upstream
=======
import { imageRoute } from '@image/routes/imageRoutes';
import { notificationRoutes } from '@notification/routes/notificationRoutes';
>>>>>>> Stashed changes
import { postRoutes } from '@post/routes/postRoutes';
import { reactionRoute } from '@reaction/routes/reactionRoutes';
import { serverAdapter } from '@service/queues/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoutes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoute.routes());
<<<<<<< Updated upstream
=======
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoute.routes());
>>>>>>> Stashed changes

  };
  routes();
};
