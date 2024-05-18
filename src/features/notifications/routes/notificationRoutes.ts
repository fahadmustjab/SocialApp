import { DeleteNotification } from '@notification/controllers/delete-notification';
import { Get } from '@notification/controllers/get-notifications';
import { UpdateNotification } from '@notification/controllers/update-notifications';
import express, { Router } from 'express';
class NotificationRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/notifications', Get.prototype.notifications);
    this.router.put('/notification/:notificationId', UpdateNotification.prototype.updateNotificationToRead);
    this.router.delete('/notification/:notificationId', DeleteNotification.prototype.deleteNotification);

    return this.router;
  }

}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
