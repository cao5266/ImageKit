# ImageKit API Server

ImageKit 后端 API 服务 - AI 图片处理平台

## 🚀 技术栈

- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** - 数据库 (MongoDB Atlas)
- **Mongoose** - ODM
- **阿里云 OSS** - 对象存储
- **阿里云百炼** - AI 图片处理
- **Google OAuth 2.0** - 用户认证
- **JWT** - 令牌认证

## 📋 前置要求

- Node.js >= 18.0.0
- npm 或 yarn
- MongoDB Atlas 账号
- 阿里云账号（OSS + 百炼平台）
- Google Cloud 项目（OAuth 2.0）

## 🛠️ 安装

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填写你的配置
```

## ⚙️ 配置

在 `.env` 文件中配置以下环境变量：

```env
# 服务器
NODE_ENV=development
PORT=3000

# 数据库
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# 阿里云 OSS
ALIYUN_OSS_ACCESS_KEY_ID=...
ALIYUN_OSS_ACCESS_KEY_SECRET=...
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=imagekit-temp

# 阿里云百炼
DASHSCOPE_API_KEY=sk-...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.getimagekit.com/api/auth/google/callback
```

## 🏃 运行

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 生产模式
npm start
```

## 📡 API 端点

### 认证

- `GET /api/auth/google` - Google OAuth 登录
- `GET /api/auth/google/callback` - OAuth 回调
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 退出登录

### 用户

- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/credits` - 获取点数余额

### 上传

- `POST /api/upload` - 上传图片到 OSS
- `POST /api/upload/sign-url` - 获取签名 URL

### 处理

- `POST /api/process/remove-watermark` - 去水印
- `GET /api/process/status/:imageId` - 获取处理状态
- `GET /api/process/history` - 获取处理历史

### 健康检查

- `GET /api/health` - 服务健康状态

## 📁 项目结构

```
api/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.ts  # MongoDB 连接
│   ├── middleware/      # 中间件
│   │   └── auth.ts      # JWT 认证
│   ├── models/          # 数据模型
│   │   ├── User.ts      # 用户模型
│   │   └── Image.ts     # 图片模型
│   ├── routes/          # 路由
│   │   ├── auth.ts      # 认证路由
│   │   ├── user.ts      # 用户路由
│   │   ├── upload.ts    # 上传路由
│   │   └── process.ts   # 处理路由
│   └── index.ts         # 入口文件
├── .env                 # 环境变量（不提交）
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 安全

- 所有 API 使用 HTTPS
- JWT 令牌过期时间 7 天
- 敏感信息存储在 .env 文件
- OSS 使用签名 URL 访问
- CORS 配置限制域名

## 📝 开发规范

- 使用 TypeScript 严格模式
- 遵循 RESTful API 设计
- 错误统一返回 JSON 格式
- 日志记录所有错误

## 🚢 部署

### 本地测试

```bash
npm run dev
```

### 服务器部署

1. 上传代码到服务器
2. 安装依赖：`npm install --production`
3. 构建项目：`npm run build`
4. 使用 PM2 运行：`pm2 start dist/index.js --name imagekit-api`

## 📄 License

MIT

## 👤 作者

卡卡老板
