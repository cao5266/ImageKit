import express from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Google OAuth 登录路由
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Google OAuth 回调路由
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // 生成 JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // 重定向到前端，携带 token
      const frontendURL = process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : process.env.FRONTEND_URL_DEV;

      res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 退出登录
router.post('/logout', (req, res) => {
  // JWT 是无状态的，客户端删除 token 即可
  return res.json({ message: 'Logged out successfully' });
});

export default router;
