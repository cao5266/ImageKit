import express from 'express';
import { authMiddleware } from '../middleware/auth';
import User from '../models/User';
import Image from '../models/Image';
import { removeWatermarkWithAI } from '../services/bailian';

const router = express.Router();

// 图片处理 - 去水印（示例）
router.post('/remove-watermark', authMiddleware, async (req, res) => {
  try {
    const { imageUrl, maskUrl } = req.body;
    const userId = req.userId!;

    if (!imageUrl) {
      return res.status(400).json({ error: '缺少图片 URL' });
    }

    // 检查用户点数
    const user = await User.findById(userId);
    if (!user || user.credits < 1) {
      return res.status(403).json({
        error: '点数不足',
        message: '请购买点数后继续使用'
      });
    }

    // 创建处理记录
    const image = await Image.create({
      userId,
      originalUrl: imageUrl,
      type: 'watermark_removal',
      status: 'processing'
    });

    // 调用百炼 AI 进行图片处理
    // 注意：百炼 AI 要求使用公共可访问的 URL（不能带签名参数）
    console.log('📸 接收到的 imageUrl:', imageUrl);
    console.log('📁 ossPath:', req.body.ossPath);
    
    try {
      const aiResult = await removeWatermarkWithAI(imageUrl, {
        prompt: '去除图像中的文字水印'
      });
      
      // 更新处理记录
      image.processedUrl = aiResult.resultUrl;
      image.status = 'completed';
      await image.save();
      
      // 扣除点数
      user.credits -= 5; // 去水印消耗 5 点数
      await user.save();

      return res.json({
        success: true,
        message: '处理成功',
        imageId: image._id,
        resultUrl: aiResult.resultUrl,
        status: 'completed',
        remainingCredits: user.credits
      });
      
    } catch (aiError: any) {
      // AI 处理失败，更新状态
      image.status = 'failed';
      image.errorMessage = aiError.message;
      await image.save();
      
      return res.status(500).json({
        success: false,
        message: aiError.message || 'AI 处理失败',
        imageId: image._id,
        status: 'failed',
        remainingCredits: user.credits
      });
    }

  } catch (error: any) {
    console.error('Process error:', error);
    return res.status(500).json({
      error: '处理失败',
      message: error.message
    });
  }
});

// 获取处理状态
router.get('/status/:imageId', authMiddleware, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId!;

    const image = await Image.findOne({ _id: imageId, userId });

    if (!image) {
      return res.status(404).json({ error: '图片不存在' });
    }

    return res.json({
      status: image.status,
      processedUrl: image.processedUrl,
      errorMessage: image.errorMessage
    });

  } catch (error: any) {
    console.error('Get status error:', error);
    return res.status(500).json({ error: '获取状态失败' });
  }
});

// 测试百炼 API 配置（开发环境）
if (process.env.NODE_ENV === 'development') {
  router.get('/test-bailian', async (req, res) => {
    try {
      const apiKey = process.env.DASHSCOPE_API_KEY;
      
      if (!apiKey) {
        return res.json({
          success: false,
          message: '❌ 百炼 API Key 未配置',
          hint: '请在 .env 文件中配置 DASHSCOPE_API_KEY'
        });
      }
      
      // 检查 API Key 格式
      if (!apiKey.startsWith('sk-')) {
        return res.json({
          success: false,
          message: '❌ API Key 格式不正确',
          hint: 'API Key 应该以 sk- 开头'
        });
      }
      
      return res.json({
        success: true,
        message: '✅ 百炼 API Key 已配置',
        config: {
          apiKey: `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 6)}`,
          length: apiKey.length
        },
        hint: '配置正确！可以开始使用 AI 去水印功能了'
      });
      
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: '测试失败',
        error: error.message
      });
    }
  });
}

// 获取用户的处理历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Image.countDocuments({ userId });

    return res.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: '获取历史记录失败' });
  }
});

export default router;
