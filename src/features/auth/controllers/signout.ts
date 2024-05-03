import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignOut {
  public async update(req: Request, res: Response) {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'Logout Successfully', user: {}, token: '' });
  }
}
