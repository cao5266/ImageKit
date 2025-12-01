// 图片格式转换工具

import type { ConvertOptions } from '@/types/tool';

/**
 * 转换图片格式
 */
export async function convertImage(
  file: File,
  options: ConvertOptions
): Promise<{
  blob: Blob;
  size: number;
  url: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      const mimeType = getMimeType(options.format);
      const quality = options.quality || 0.92;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('转换失败'));
            return;
          }
          
          resolve({
            blob,
            size: blob.size,
            url: URL.createObjectURL(blob),
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 批量转换图片格式
 */
export async function batchConvertImages(
  files: File[],
  options: ConvertOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{
  file: File;
  result: Awaited<ReturnType<typeof convertImage>>;
}>> {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await convertImage(files[i], options);
    results.push({ file: files[i], result });
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}

function getMimeType(format: ConvertOptions['format']): string {
  const mimeTypes = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };
  return mimeTypes[format];
}
