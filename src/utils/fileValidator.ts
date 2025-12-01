// 文件验证工具

import { IMAGE_CONFIG } from '@/constants/config';
import { ImageKitError, ErrorCode } from '@/types/error';

/**
 * 验证文件是否为有效图片
 */
export function validateImageFile(file: File): void {
  // 检查文件类型
  if (!IMAGE_CONFIG.supportedFormats.includes(file.type)) {
    throw new ImageKitError(
      ErrorCode.INVALID_FORMAT,
      `不支持的图片格式: ${file.type}`
    );
  }
  
  // 检查文件大小
  if (file.size > IMAGE_CONFIG.maxFileSize) {
    throw new ImageKitError(
      ErrorCode.FILE_TOO_LARGE,
      `文件过大: ${formatFileSize(file.size)}，最大支持 ${formatFileSize(IMAGE_CONFIG.maxFileSize)}`
    );
  }
}

/**
 * 批量验证文件
 */
export function validateImageFiles(files: File[]): {
  valid: File[];
  invalid: Array<{ file: File; error: string }>;
} {
  const valid: File[] = [];
  const invalid: Array<{ file: File; error: string }> = [];
  
  files.forEach(file => {
    try {
      validateImageFile(file);
      valid.push(file);
    } catch (error) {
      invalid.push({
        file,
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  });
  
  return { valid, invalid };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

/**
 * 生成唯一文件名
 */
export function generateUniqueFilename(originalName: string, suffix?: string): string {
  const ext = getFileExtension(originalName);
  const name = originalName.slice(0, originalName.lastIndexOf('.'));
  const timestamp = Date.now();
  
  return suffix 
    ? `${name}_${suffix}.${ext}`
    : `${name}_${timestamp}.${ext}`;
}
