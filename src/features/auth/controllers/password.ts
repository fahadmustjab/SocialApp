import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink!);
    emailQueue.addEmailJob('resetPasswordEmail', { receiverEmail: existingUser.email!, subject: 'Reset Your Password', template: template });
    res.status(HTTP_STATUS.OK).json({ message: 'Reset Password Link Sent', token: randomCharacters, });

  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password } = req.body;
    const { token } = req.params;
    const existingUser: IAuthDocument = await authService.getUserByToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token expired');
    }
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPasswordEmail', { receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation', template: template });
    res.status(HTTP_STATUS.OK).json({ message: 'Reset Password Link Sent', });

  }
}
