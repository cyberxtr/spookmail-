import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface AuthRequest extends Request {
  admin?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.session?.adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = await storage.getAdmin(req.session.adminId);
    if (!admin) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.session?.adminId) {
      const admin = await storage.getAdmin(req.session.adminId);
      if (admin) {
        req.admin = admin;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};