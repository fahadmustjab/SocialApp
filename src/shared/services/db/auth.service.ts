import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('authService');
export class AuthService {

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    try {
      await AuthModel.create(data);
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<IAuthDocument | unknown> {
    try {
      return await AuthModel.findOneAndUpdate({ _id: authId }, { passwordResetToken: token, passwordResetExpires: tokenExpiration });
    } catch (error) {
      log.error(error);
      throw error;

    }
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getUserByUsername(username: string,): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) },]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
    return user;
  }
  public async getUserByToken(token: string,): Promise<IAuthDocument> {

    const user: IAuthDocument = (await AuthModel.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService = new AuthService();
