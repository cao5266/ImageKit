// 图片状态管理

import { create } from 'zustand';
import type { ProcessedImage } from '@/types/image';
import type { ToolType } from '@/types/tool';

interface ImageStore {
  // 状态
  images: ProcessedImage[];
  currentTool: ToolType;
  
  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, data: Partial<ProcessedImage>) => void;
  clearAll: () => void;
  setCurrentTool: (tool: ToolType) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  // 初始状态
  images: [],
  currentTool: 'compress',
  
  // 添加图片
  addImages: (files) => set((state) => ({
    images: [
      ...state.images,
      ...files.map(file => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalUrl: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending' as const,
      }))
    ]
  })),
  
  // 移除图片
  removeImage: (id) => set((state) => {
    // 释放 URL 对象避免内存泄漏
    const image = state.images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.originalUrl);
      if (image.processedUrl) {
        URL.revokeObjectURL(image.processedUrl);
      }
    }
    
    return {
      images: state.images.filter(img => img.id !== id)
    };
  }),
  
  // 更新图片
  updateImage: (id, data) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, ...data } : img
    )
  })),
  
  // 清空所有图片
  clearAll: () => set((state) => {
    // 释放所有 URL 对象
    state.images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    
    return { images: [] };
  }),
  
  // 设置当前工具
  setCurrentTool: (tool) => set({ currentTool: tool }),
}));
