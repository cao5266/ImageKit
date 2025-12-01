import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      currentUser?: IUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 从 header 获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '未提供认证令牌'
      });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证 token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '用户不存在'
      });
      return;
    }

    // 将用户信息附加到请求对象
    req.currentUser = user;
    req.userId = user._id.toString();

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: '无效的认证令牌'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: '认证令牌已过期'
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '认证失败'
    });
    return;
  }
};

// 可选认证中间件（用户可以未登录也能访问）
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.currentUser = user;
      req.userId = user._id.toString();
    }

    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};
