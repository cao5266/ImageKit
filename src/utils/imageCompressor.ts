// 图片压缩工具（优化版）

import imageCompression from 'browser-image-compression';
import type { CompressOptions } from '@/types/tool';

/**
 * 高级压缩图片 - 多级压缩策略
 * @param file 原始图片文件
 * @param options 压缩选项
 * @param outputFormat 输出格式（可选）
 * @returns 压缩后的 Blob 和元数据
 */
export async function compressImage(
  file: File,
  options: CompressOptions,
  outputFormat?: 'original' | 'jpeg' | 'png' | 'webp'
): Promise<{
  blob: Blob;
  size: number;
  compressionRatio: number;
  url: string;
}> {
  try {
    // 计算目标质量（更激进的压缩）
    const quality = options.quality / 100;
    
    // 根据文件大小智能调整压缩策略
    const fileSizeMB = file.size / 1024 / 1024;
    
    // 确定最终输出的文件格式
    const targetFileType = 
      outputFormat === 'jpeg' ? 'image/jpeg' :
      outputFormat === 'png' ? 'image/png' :
      outputFormat === 'webp' ? 'image/webp' :
      file.type; // 使用原格式
    
    let compressOptions: any;
    
    if (fileSizeMB > 5) {
      // 大文件：激进压缩
      compressOptions = {
        maxSizeMB: 0.5, // 限制最大500KB
        maxWidthOrHeight: 1920, // 限制最大分辨率
        useWebWorker: true,
        initialQuality: quality * 0.85, // 降低初始质量
        alwaysKeepResolution: false,
        fileType: targetFileType, // 使用目标格式
      };
    } else if (fileSizeMB > 2) {
      // 中等文件：适中压缩
      compressOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        initialQuality: quality * 0.9,
        alwaysKeepResolution: false,
        fileType: targetFileType,
      };
    } else {
      // 小文件：标准压缩
      compressOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        initialQuality: quality,
        alwaysKeepResolution: false,
        fileType: targetFileType,
      };
    }

    // 第一次压缩
    let compressedBlob = await imageCompression(file, compressOptions);
    
    // 如果压缩效果不理想（压缩率<30%），进行二次压缩
    const firstCompressionRatio = ((file.size - compressedBlob.size) / file.size) * 100;
    
    if (firstCompressionRatio < 30 && compressedBlob.size > 500 * 1024) {
      // 二次压缩：降低质量
      const secondCompressOptions = {
        ...compressOptions,
        maxSizeMB: compressOptions.maxSizeMB * 0.7,
        initialQuality: quality * 0.75,
      };
      
      const secondFile = new File([compressedBlob], file.name, { type: file.type });
      compressedBlob = await imageCompression(secondFile, secondCompressOptions);
    }
    
    const finalCompressionRatio = ((file.size - compressedBlob.size) / file.size) * 100;
    
    return {
      blob: compressedBlob,
      size: compressedBlob.size,
      compressionRatio: finalCompressionRatio,
      url: URL.createObjectURL(compressedBlob),
    };
  } catch (error) {
    throw new Error(`压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 批量压缩图片
 */
export async function batchCompressImages(
  files: File[],
  options: CompressOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{
  file: File;
  result: Awaited<ReturnType<typeof compressImage>>;
}>> {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options);
    results.push({ file: files[i], result });
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}
