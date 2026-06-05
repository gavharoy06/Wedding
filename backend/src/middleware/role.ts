//middleware/role.ts

import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Avtorizatsiya talab qilinadi.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: 'Bu amalni bajarish uchun ruxsat yo\'q.' 
      });
      return;
    }

    next();
  };
};