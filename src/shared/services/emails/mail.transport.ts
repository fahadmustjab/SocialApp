import { config } from '@root/config';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import nodeMailer from 'nodemailer';
import { BadRequestError, ServerError } from '@global/helpers/error-handler';
import Mail from 'nodemailer/lib/mailer';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');


sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {

  public async sendMail(reciverEmail: string, subject: string, body: string) {
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      await this.developmentEmailSender(reciverEmail, subject, body);
    } else if (config.NODE_ENV == 'production') {
      await this.productionEmailSender(reciverEmail, subject, body);
    } else {
      throw new ServerError('Something went wrong');
    }
  }
  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodeMailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!,
      },
    });
    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);

    try {
      await transporter.sendMail(info);
      log.info('Development mail sent successfully');

    } catch (error) {
      log.error(error);
      throw new BadRequestError('Error sending mail');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {

    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };


    try {
      await sendGridMail.send(mailOptions);
      log.info('Production mail sent successfully');
    } catch (error) {
      log.error(error);
      throw new BadRequestError('Error sending mail');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
