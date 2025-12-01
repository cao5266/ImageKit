// 图片压缩页面

import { useState } from 'react';
import { Dropzone } from '@/components/ImageUploader/Dropzone';
import { ImageCard } from '@/components/ImagePreview/ImageCard';
import { ImageListItem } from '@/components/ImagePreview/ImageListItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useImageStore } from '@/store/imageStore';
import { compressImage } from '@/utils/imageCompressor';
import { downloadFile, downloadAsZip } from '@/utils/downloadHelper';
import { Download, Trash2, Grid3x3, List } from 'lucide-react';

export function Compress() {
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const images = useImageStore(state => state.images);
  const updateImage = useImageStore(state => state.updateImage);
  const clearAll = useImageStore(state => state.clearAll);
  
  // 压缩预设
  const presets = [
    { label: '高质量', quality: 90, desc: '轻度压缩，保持画质' },
    { label: '标准', quality: 80, desc: '平衡质量和大小' },
    { label: '高压缩', quality: 60, desc: '大幅缩小，适合网页' },
  ];
  
  // 输出格式选项
  const formatOptions = [
    { value: 'original' as const, label: '原格式' },
    { value: 'jpeg' as const, label: 'JPG' },
    { value: 'png' as const, label: 'PNG' },
    { value: 'webp' as const, label: 'WebP' },
  ];
  
  // 压缩单张图片（直接压缩为目标格式）
  const handleCompressSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    try {
      updateImage(imageId, { status: 'processing' });
      
      // 直接压缩为目标格式，显示的大小就是最终导出的大小
      const result = await compressImage(
        image.originalFile, 
        { quality },
        outputFormat
      );
      
      updateImage(imageId, {
        status: 'completed',
        processedUrl: result.url,
        processedSize: result.size,
        compressionRatio: result.compressionRatio,
      });
    } catch (error) {
      updateImage(imageId, { 
        status: 'error',
        error: error instanceof Error ? error.message : '压缩失败'
      });
    }
  };
  
  // 批量压缩所有图片（支持重新压缩）
  const handleCompressAll = async () => {
    if (images.length === 0) return;
    
    setProcessing(true);
    
    try {
      // 压缩所有图片，包括已完成的（参数改变时可以重新压缩）
      for (const image of images) {
        await handleCompressSingle(image.id);
      }
    } finally {
      setProcessing(false);
    }
  };
  
  // 下载单张图片（已经是目标格式）
  const handleDownloadSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.processedUrl) return;
    
    try {
      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      
      // 修改文件名扩展名
      const originalName = image.originalFile.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      const newExt = outputFormat === 'original' ? 
        originalName.substring(originalName.lastIndexOf('.')) :
        `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
      
      downloadFile(blob, `${nameWithoutExt}${newExt}`);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };
  
  // 批量下载所有图片（已经是目标格式）
  const handleDownloadAll = async () => {
    const completedImages = images.filter(
      img => img.status === 'completed' && img.processedUrl
    );
    
    if (completedImages.length === 0) return;
    
    const files = await Promise.all(
      completedImages.map(async (img) => {
        const response = await fetch(img.processedUrl!);
        const blob = await response.blob();
        
        // 修改文件名扩展名
        const originalName = img.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const newExt = outputFormat === 'original' ? 
          originalName.substring(originalName.lastIndexOf('.')) :
          `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
        
        return {
          blob,
          filename: `${nameWithoutExt}${newExt}`,
        };
      })
    );
    
    await downloadAsZip(files, 'compressed-images.zip');
  };
  
  const completedCount = images.filter(img => img.status === 'completed').length;
  const hasImages = images.length > 0;
  const hasCompleted = completedCount > 0;
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">图片压缩</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            减小文件大小，保持画质，支持批量处理
          </p>
        </div>
        
        {/* 视图切换按钮 */}
        {hasImages && (
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 工具面板 - 移动端在顶部，桌面端在左侧 */}
        <div className="lg:col-span-1 order-first">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-bold mb-4 text-base sm:text-lg">压缩设置</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* 快速预设 */}
              <div>
                <label className="text-sm font-medium mb-2 block">快速预设</label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.quality}
                      variant={quality === preset.quality ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuality(preset.quality)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {presets.find(p => p.quality === quality)?.desc || '自定义质量'}
                </p>
              </div>
              
              {/* 输出格式 */}
              <div>
                <label className="text-sm font-medium mb-2 block">输出格式</label>
                <div className="grid grid-cols-4 gap-2">
                  {formatOptions.map((format) => (
                    <Button
                      key={format.value}
                      variant={outputFormat === format.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOutputFormat(format.value)}
                      className="text-xs"
                    >
                      {format.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 显示的大小即为{outputFormat === 'original' ? '原格式' : outputFormat.toUpperCase()}最终大小
                </p>
              </div>
              
              {/* 质量滑块 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">精细调节</label>
                  <span className="text-sm font-bold text-primary">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(val) => setQuality(val[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  {hasCompleted 
                    ? '💡 修改参数后点击"重新压缩"生效' 
                    : '推荐80%（接近TinyPNG效果）'
                  }
                </p>
              </div>
              
              {/* 统计信息 */}
              {hasImages && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">总数</span>
                    <span className="font-medium">{images.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">已完成</span>
                    <span className="font-medium text-green-600">{completedCount}</span>
                  </div>
                </div>
              )}
              
              {/* 操作按钮 */}
              <div className="space-y-2">
                <Button
                  onClick={handleCompressAll}
                  disabled={!hasImages || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing 
                    ? '压缩中...' 
                    : hasCompleted 
                      ? `重新压缩 ${images.length}张` 
                      : `压缩 ${images.length}张`
                  }
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    disabled={!hasCompleted}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span>下载 ({completedCount})</span>
                  </Button>
                  
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    disabled={!hasImages}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span>清空</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* 主内容区 */}
        <div className="lg:col-span-3">
          {!hasImages ? (
            <Dropzone />
          ) : viewMode === 'grid' ? (
            // 网格视图
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {images.map(image => (
                <ImageCard 
                  key={image.id} 
                  image={image} 
                  onDownload={handleDownloadSingle}
                />
              ))}
            </div>
          ) : (
            // 列表视图
            <div className="space-y-2 sm:space-y-3">
              {images.map(image => (
                <ImageListItem
                  key={image.id}
                  image={image}
                  onDownload={handleDownloadSingle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
