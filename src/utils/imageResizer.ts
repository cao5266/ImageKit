// 图片尺寸调整工具

import type { ResizeOptions } from '@/types/tool';

/**
 * 调整图片尺寸
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<{
  blob: Blob;
  size: number;
  width: number;
  height: number;
  url: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        options
      );
      
      canvas.width = width;
      canvas.height = height;
      
      // 使用高质量缩放
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('调整失败'));
            return;
          }
          
          resolve({
            blob,
            size: blob.size,
            width,
            height,
            url: URL.createObjectURL(blob),
          });
        },
        file.type,
        0.92
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 计算目标尺寸
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ResizeOptions
): { width: number; height: number } {
  // 按百分比缩放
  if (options.scale) {
    return {
      width: Math.round(originalWidth * options.scale / 100),
      height: Math.round(originalHeight * options.scale / 100),
    };
  }
  
  // 指定宽高，不保持比例
  if (options.width && options.height && !options.keepAspectRatio) {
    return { width: options.width, height: options.height };
  }
  
  // 指定宽度，保持比例
  if (options.width && options.keepAspectRatio) {
    const ratio = options.width / originalWidth;
    return {
      width: options.width,
      height: Math.round(originalHeight * ratio),
    };
  }
  
  // 指定高度，保持比例
  if (options.height && options.keepAspectRatio) {
    const ratio = options.height / originalHeight;
    return {
      width: Math.round(originalWidth * ratio),
      height: options.height,
    };
  }
  
  // 默认返回原尺寸
  return { width: originalWidth, height: originalHeight };
}

/**
 * 批量调整图片尺寸
 */
export async function batchResizeImages(
  files: File[],
  options: ResizeOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{
  file: File;
  result: Awaited<ReturnType<typeof resizeImage>>;
}>> {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await resizeImage(files[i], options);
    results.push({ file: files[i], result });
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}
