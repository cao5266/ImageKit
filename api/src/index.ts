// ⚠️ 必须先加载环境变量！
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database';
import passport from './config/passport';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import processRoutes from './routes/process';
import userRoutes from './routes/user';

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 初始化 Passport
app.use(passport.initialize());

// 连接数据库
connectDB();

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/process', processRoutes);
app.use('/api/user', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ImageKit API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 开发环境：查看所有用户（仅用于测试）
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/users', async (req, res) => {
    try {
      const User = (await import('./models/User')).default;
      const users = await User.find().select('-__v').limit(10);
      return res.json({
        total: users.length,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          name: u.name,
          avatar: u.avatar,
          vipLevel: u.vipLevel,
          credits: u.credits,
          googleId: u.googleId ? '已绑定' : '未绑定',
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt
        }))
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
}

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: 'ImageKit API',
    version: '1.0.0',
    description: 'AI 图片处理平台后端服务',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      upload: '/api/upload',
      process: '/api/process',
      user: '/api/user'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('====================================');
  console.log('🚀 ImageKit API Server Started');
  console.log('====================================');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString('zh-CN')}`);
  console.log('====================================');
  console.log('');
});

export default app;