// 图片裁剪工具

import type { CropOptions } from '@/types/tool';

/**
 * 裁剪图片
 */
export async function cropImage(
  file: File,
  options: CropOptions
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
      // 计算裁剪区域
      const cropArea = calculateCropArea(img.width, img.height, options);
      
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 绘制裁剪后的图片
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height
        );
      }
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('裁剪失败'));
            return;
          }
          
          resolve({
            blob,
            size: blob.size,
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
 * 计算裁剪区域
 */
function calculateCropArea(
  imageWidth: number,
  imageHeight: number,
  options: CropOptions
): { x: number; y: number; width: number; height: number } {
  // 如果指定了具体坐标和尺寸
  if (options.x !== undefined && options.y !== undefined && 
      options.width !== undefined && options.height !== undefined) {
    return {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };
  }
  
  // 如果指定了裁剪比例（如 16:9, 1:1 等）
  if (options.aspectRatio) {
    const [ratioWidth, ratioHeight] = options.aspectRatio.split(':').map(Number);
    const targetRatio = ratioWidth / ratioHeight;
    const currentRatio = imageWidth / imageHeight;
    
    let cropWidth, cropHeight, x, y;
    
    if (currentRatio > targetRatio) {
      // 图片太宽，裁剪左右
      cropHeight = imageHeight;
      cropWidth = Math.round(cropHeight * targetRatio);
      x = Math.round((imageWidth - cropWidth) / 2);
      y = 0;
    } else {
      // 图片太高，裁剪上下
      cropWidth = imageWidth;
      cropHeight = Math.round(cropWidth / targetRatio);
      x = 0;
      y = Math.round((imageHeight - cropHeight) / 2);
    }
    
    return { x, y, width: cropWidth, height: cropHeight };
  }
  
  // 默认返回中心区域的 80%
  const cropWidth = Math.round(imageWidth * 0.8);
  const cropHeight = Math.round(imageHeight * 0.8);
  
  return {
    x: Math.round((imageWidth - cropWidth) / 2),
    y: Math.round((imageHeight - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * 批量裁剪图片
 */
export async function batchCropImages(
  files: File[],
  options: CropOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{
  file: File;
  result: Awaited<ReturnType<typeof cropImage>>;
}>> {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await cropImage(files[i], options);
    results.push({ file: files[i], result });
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}
