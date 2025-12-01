// 图片类型定义

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  
  compressionRatio?: number;
  
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  
  metadata?: Record<string, any>;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  format: string;
  size: number;
  dimensions: ImageDimensions;
  createdAt: Date;
}
