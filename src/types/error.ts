// 错误类型定义

export enum ErrorCode {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
}

export class ImageKitError extends Error {
  code: ErrorCode;
  
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ImageKitError';
  }
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.FILE_TOO_LARGE]: '文件过大，请选择小于 10MB 的图片',
  [ErrorCode.INVALID_FORMAT]: '不支持的图片格式，请上传 JPG/PNG/WebP',
  [ErrorCode.PROCESSING_FAILED]: '处理失败，请重试',
  [ErrorCode.BROWSER_NOT_SUPPORTED]: '您的浏览器版本过低，请升级浏览器',
  [ErrorCode.OUT_OF_MEMORY]: '图片过大导致内存不足，请减小图片尺寸',
};
