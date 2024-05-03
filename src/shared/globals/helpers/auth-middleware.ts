import { NextFunction, Request, Response } from 'express';
import { NotAuthorized } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

export class AuthMiddleWare {
  public verifyUser(req: Request, res: Response, next: NextFunction) {
    if (!req.session?.jwt) {
      throw new NotAuthorized('Token is expired. Please login again');
    }
    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;

    } catch (error) {
      throw new NotAuthorized('Token is expired. Please login again');
    }
    next();
  }
  public checkAuthentication(req: Request, res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new NotAuthorized('Authentication is required to access this route');
    }

    next();
  }
}

export const authMiddleware: AuthMiddleWare = new AuthMiddleWare();
