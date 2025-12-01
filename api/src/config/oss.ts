import OSS from 'ali-oss';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 阿里云 OSS 配置
 */
export const ossConfig = {
  region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.ALIYUN_OSS_BUCKET || 'imagekit-temp',
  endpoint: process.env.ALIYUN_OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
};

/**
 * 创建 OSS 客户端实例
 */
export const createOSSClient = (): OSS => {
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    throw new Error('OSS AccessKey 未配置！请检查环境变量');
  }

  return new OSS({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
  });
};

/**
 * OSS 文件路径配置
 */
export const ossPathConfig = {
  // 原始上传的图片
  original: 'original/',
  // 处理后的图片
  processed: 'processed/',
  // 临时文件
  temp: 'temp/',
};

export default createOSSClient;
