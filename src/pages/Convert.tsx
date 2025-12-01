// 图片格式转换页面

import { useState } from 'react';
import { Dropzone } from '@/components/ImageUploader/Dropzone';
import { ImageCard } from '@/components/ImagePreview/ImageCard';
import { ImageListItem } from '@/components/ImagePreview/ImageListItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useImageStore } from '@/store/imageStore';
import { convertImage } from '@/utils/imageConverter';
import { downloadFile, downloadAsZip } from '@/utils/downloadHelper';
import { Download, Trash2, Grid3x3, List } from 'lucide-react';

export function Convert() {
  const [quality, setQuality] = useState(92);
  const [processing, setProcessing] = useState(false);
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const images = useImageStore(state => state.images);
  const updateImage = useImageStore(state => state.updateImage);
  const clearAll = useImageStore(state => state.clearAll);
  
  // 格式选项
  const formatOptions = [
    { value: 'jpeg' as const, label: 'JPG', desc: '通用格式，兼容性好' },
    { value: 'png' as const, label: 'PNG', desc: '无损格式，支持透明' },
    { value: 'webp' as const, label: 'WebP', desc: '现代格式，体积小' },
  ];
  
  // 转换单张图片
  const handleConvertSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    try {
      updateImage(imageId, { status: 'processing' });
      
      const result = await convertImage(image.originalFile, {
        format: targetFormat,
        quality: quality / 100,
      });
      
      updateImage(imageId, {
        status: 'completed',
        processedUrl: result.url,
        processedSize: result.size,
        compressionRatio: ((image.originalSize - result.size) / image.originalSize) * 100,
      });
    } catch (error) {
      updateImage(imageId, { 
        status: 'error',
        error: error instanceof Error ? error.message : '转换失败'
      });
    }
  };
  
  // 批量转换所有图片（支持重新转换）
  const handleConvertAll = async () => {
    if (images.length === 0) return;
    
    setProcessing(true);
    
    try {
      for (const image of images) {
        await handleConvertSingle(image.id);
      }
    } finally {
      setProcessing(false);
    }
  };
  
  // 下载单张图片
  const handleDownloadSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.processedUrl) return;
    
    try {
      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      
      // 修改文件名扩展名
      const originalName = image.originalFile.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      const newExt = `.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
      
      downloadFile(blob, `${nameWithoutExt}${newExt}`);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };
  
  // 批量下载所有图片
  const handleDownloadAll = async () => {
    const completedImages = images.filter(
      img => img.status === 'completed' && img.processedUrl
    );
    
    if (completedImages.length === 0) return;
    
    const files = await Promise.all(
      completedImages.map(async (img) => {
        const response = await fetch(img.processedUrl!);
        const blob = await response.blob();
        
        const originalName = img.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const newExt = `.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
        
        return {
          blob,
          filename: `${nameWithoutExt}${newExt}`,
        };
      })
    );
    
    await downloadAsZip(files, 'converted-images.zip');
  };
  
  const completedCount = images.filter(img => img.status === 'completed').length;
  const hasImages = images.length > 0;
  const hasCompleted = completedCount > 0;
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">格式转换</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            JPG、PNG、WebP 互转，支持批量处理
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
        {/* 工具面板 */}
        <div className="lg:col-span-1 order-first">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-bold mb-4 text-base sm:text-lg">转换设置</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* 目标格式 */}
              <div>
                <label className="text-sm font-medium mb-2 block">目标格式</label>
                <div className="grid grid-cols-3 gap-2">
                  {formatOptions.map((format) => (
                    <Button
                      key={format.value}
                      variant={targetFormat === format.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetFormat(format.value)}
                      className="text-xs"
                    >
                      {format.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatOptions.find(f => f.value === targetFormat)?.desc}
                </p>
              </div>
              
              {/* 质量调节（仅 JPEG 和 WebP） */}
              {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">输出质量</label>
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
                      ? '💡 修改参数后点击"重新转换"生效' 
                      : '推荐92%（高质量输出）'
                    }
                  </p>
                </div>
              )}
              
              {/* PNG 提示 */}
              {targetFormat === 'png' && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 PNG 为无损格式，不支持质量调节，会保留原始质量和透明度
                  </p>
                </div>
              )}
              
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
                  onClick={handleConvertAll}
                  disabled={!hasImages || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing 
                    ? '转换中...' 
                    : hasCompleted 
                      ? `重新转换 ${images.length}张` 
                      : `转换 ${images.length}张`
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
