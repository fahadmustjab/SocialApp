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
    }
  }
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
}

export const authService = new AuthService();
