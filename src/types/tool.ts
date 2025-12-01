// 工具类型定义

export type ToolType = 'compress' | 'convert' | 'resize' | 'crop' | 'rotate';

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface CompressOptions {
  quality: number; // 0-100
  maxSizeMB?: number;
}

export interface ConvertOptions {
  format: 'jpeg' | 'png' | 'webp' | 'bmp';
  quality?: number; // 0-1
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  scale?: number; // 百分比
  keepAspectRatio: boolean;
}

export interface CropOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  aspectRatio?: string; // 例如: '16:9', '1:1', '4:3'
}

export interface RotateOptions {
  angle: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}
