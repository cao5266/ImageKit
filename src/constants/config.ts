// 常量配置

export const APP_CONFIG = {
  name: 'ImageKit',
  description: '免费在线图片处理工具',
  url: 'https://imagekit.com',
  author: '卡卡老板',
  version: '1.0.0',
};

export const IMAGE_CONFIG = {
  // 支持的图片格式
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
  
  // 文件大小限制（字节）
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // 批量处理最大数量
  maxBatchCount: 100,
  
  // 默认压缩质量
  defaultQuality: 80,
  
  // 预设尺寸
  presetSizes: [
    { label: '社交媒体 - Instagram 正方形', width: 1080, height: 1080 },
    { label: '社交媒体 - Instagram 竖版', width: 1080, height: 1350 },
    { label: '社交媒体 - 微信公众号封面', width: 900, height: 500 },
    { label: 'Full HD', width: 1920, height: 1080 },
    { label: 'HD', width: 1280, height: 720 },
    { label: '电商商品图', width: 800, height: 800 },
  ],
  
  // 预设裁剪比例
  presetAspectRatios: [
    { label: '1:1 (正方形)', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '3:2', value: 3/2 },
    { label: '9:16 (竖屏)', value: 9/16 },
  ],
};

export const TOOL_CONFIG = {
  compress: {
    id: 'compress',
    name: '图片压缩',
    description: '减小文件大小，不损失画质',
    icon: 'Minimize2',
    path: '/compress',
  },
  convert: {
    id: 'convert',
    name: '格式转换',
    description: 'JPG、PNG、WebP 互转',
    icon: 'RefreshCw',
    path: '/convert',
  },
  resize: {
    id: 'resize',
    name: '调整大小',
    description: '修改图片尺寸',
    icon: 'Maximize2',
    path: '/resize',
  },
  crop: {
    id: 'crop',
    name: '图片裁剪',
    description: '裁剪图片区域',
    icon: 'Crop',
    path: '/crop',
  },
  rotate: {
    id: 'rotate',
    name: '旋转翻转',
    description: '旋转或翻转图片',
    icon: 'RotateCw',
    path: '/rotate',
  },
} as const;
