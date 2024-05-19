import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationsTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, message, header } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notifications-template.ejs', 'utf8'), {
      username,
      message,
      header,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });


  }
}

export const notificationsTemplate: NotificationsTemplate = new NotificationsTemplate();
