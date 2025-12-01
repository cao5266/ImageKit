import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import OSS from 'ali-oss';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// 配置 multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 20) * 1024 * 1024 // 默认 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPEG、PNG 和 WEBP 格式的图片'));
    }
  }
});

// 创建 OSS 客户端
const createOSSClient = () => {
  return new OSS({
    region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
    accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALIYUN_OSS_BUCKET || 'imagekit-temp'
  });
};

// 上传图片到 OSS
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    // 生成唯一文件名
    const ext = path.extname(req.file.originalname);
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const ossPath = `original/${filename}`;

    // 上传到 OSS
    const client = createOSSClient();
    const result = await client.put(ossPath, req.file.buffer);
    
    // 设置文件的 HTTP 响应头，允许跨域和公开访问
    await client.putMeta(ossPath, {
      'Cache-Control': 'public, max-age=31536000',
      'x-oss-object-acl': 'public-read'
    }).catch(err => {
      console.warn('设置文件元数据失败（可能权限不足）:', err.message);
    });

    // 生成公共 URL（不带签名，供百炼 AI 使用）
    const publicUrl = `https://${process.env.ALIYUN_OSS_BUCKET}.${process.env.ALIYUN_OSS_REGION}.aliyuncs.com/${ossPath}`;
    
    // 生成签名 URL（有效期 24 小时，供前端预览使用）
    const signedUrl = client.signatureUrl(ossPath, {
      expires: 86400
    });

    return res.json({
      success: true,
      url: publicUrl,           // 公共 URL（给百炼 AI 用）
      signedUrl: signedUrl,     // 签名 URL（给前端预览用）
      ossPath,
      filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: '上传失败',
      message: error.message
    });
  }
});

// 获取签名 URL（用于访问私有文件）
router.post('/sign-url', authMiddleware, async (req, res) => {
  try {
    const { ossPath, expires = 3600 } = req.body;

    if (!ossPath) {
      return res.status(400).json({ error: 'ossPath is required' });
    }

    const client = createOSSClient();
    const url = client.signatureUrl(ossPath, { expires });

    return res.json({ url });
  } catch (error: any) {
    console.error('Sign URL error:', error);
    return res.status(500).json({ error: '生成签名 URL 失败' });
  }
});

// 测试 OSS 连接（开发环境）
if (process.env.NODE_ENV === 'development') {
  router.get('/test-oss', async (req, res) => {
    try {
      const client = createOSSClient();
      
      // 测试上传一个小文件
      const testContent = `OSS 连接测试 - ${new Date().toISOString()}`;
      const testPath = `test/${Date.now()}.txt`;
      
      const result = await client.put(testPath, Buffer.from(testContent));
      
      // 生成访问 URL
      const url = client.signatureUrl(testPath, { expires: 3600 });
      
      // 列出 bucket 信息
      const bucketInfo = await client.getBucketInfo();
      
      return res.json({
        success: true,
        message: 'OSS 连接成功！',
        config: {
          region: process.env.ALIYUN_OSS_REGION,
          bucket: process.env.ALIYUN_OSS_BUCKET,
          endpoint: process.env.ALIYUN_OSS_ENDPOINT
        },
        testFile: {
          path: testPath,
          url: url,
          uploadResult: result.res.status
        },
        bucketInfo: {
          name: bucketInfo.bucket.name,
          region: bucketInfo.bucket.region,
          creationDate: bucketInfo.bucket.creationDate
        }
      });
    } catch (error: any) {
      console.error('OSS 测试失败:', error);
      return res.status(500).json({
        success: false,
        error: 'OSS 连接失败',
        message: error.message,
        code: error.code
      });
    }
  });
}

export default router;
