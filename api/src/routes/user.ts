import express from 'express';
import { authMiddleware } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.userId!;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.json({
      success: true,
      user
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 获取点数余额
router.get('/credits', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('credits vipLevel');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    return res.json({
      credits: user.credits,
      vipLevel: user.vipLevel
    });

  } catch (error: any) {
    console.error('Get credits error:', error);
    return res.status(500).json({ error: '获取点数失败' });
  }
});

export default router;
