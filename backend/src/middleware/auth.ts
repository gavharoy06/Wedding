import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Cookie dan tokenni olamiz
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: 'Token topilmadi. Tizimga kiring.' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token yaroqsiz yoki muddati tugagan.' });
  }
};