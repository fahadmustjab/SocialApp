import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationsTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, message, header } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notifications-template.ejs', 'utf8'), {
      username,
      message,
      header
    });


  }
}

export const notificationsTemplate: NotificationsTemplate = new NotificationsTemplate();
