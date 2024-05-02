import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/schema/user.schema';

export class UserService {

  public async createUser(data: IUserDocument): Promise<IUserDocument> {
    return await UserModel.create(data);
  }

}

export const userService = new UserService();
