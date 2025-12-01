// 图片尺寸调整页面

import { useState } from 'react';
import { Dropzone } from '@/components/ImageUploader/Dropzone';
import { ImageCard } from '@/components/ImagePreview/ImageCard';
import { ImageListItem } from '@/components/ImagePreview/ImageListItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useImageStore } from '@/store/imageStore';
import { resizeImage } from '@/utils/imageResizer';
import { downloadFile, downloadAsZip } from '@/utils/downloadHelper';
import { Download, Trash2, Grid3x3, List } from 'lucide-react';

export function Resize() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [scale, setScale] = useState('100');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState<'dimension' | 'scale'>('dimension');
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const images = useImageStore(state => state.images);
  const updateImage = useImageStore(state => state.updateImage);
  const clearAll = useImageStore(state => state.clearAll);
  
  // 预设尺寸
  const presetSizes = [
    { label: '1920×1080', width: 1920, height: 1080 },
    { label: '1280×720', width: 1280, height: 720 },
    { label: '800×600', width: 800, height: 600 },
    { label: '640×480', width: 640, height: 480 },
  ];
  
  // 预设比例
  const presetScales = [
    { label: '200%', value: 200 },
    { label: '150%', value: 150 },
    { label: '100%', value: 100 },
    { label: '75%', value: 75 },
    { label: '50%', value: 50 },
    { label: '25%', value: 25 },
  ];
  
  // 调整单张图片
  const handleResizeSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    try {
      updateImage(imageId, { status: 'processing' });
      
      const options = resizeMode === 'scale'
        ? { scale: Number(scale), keepAspectRatio: true }
        : {
            width: width ? Number(width) : undefined,
            height: height ? Number(height) : undefined,
            keepAspectRatio,
          };
      
      const result = await resizeImage(image.originalFile, options);
      
      updateImage(imageId, {
        status: 'completed',
        processedUrl: result.url,
        processedSize: result.size,
        compressionRatio: ((image.originalSize - result.size) / image.originalSize) * 100,
      });
    } catch (error) {
      updateImage(imageId, { 
        status: 'error',
        error: error instanceof Error ? error.message : '调整失败'
      });
    }
  };
  
  // 批量调整所有图片
  const handleResizeAll = async () => {
    if (images.length === 0) return;
    
    setProcessing(true);
    
    try {
      for (const image of images) {
        await handleResizeSingle(image.id);
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
      downloadFile(blob, image.originalFile.name);
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
        return {
          blob,
          filename: img.originalFile.name,
        };
      })
    );
    
    await downloadAsZip(files, 'resized-images.zip');
  };
  
  const completedCount = images.filter(img => img.status === 'completed').length;
  const hasImages = images.length > 0;
  const hasCompleted = completedCount > 0;
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">调整大小</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            修改图片尺寸，支持像素和百分比调整
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
            <h2 className="font-bold mb-4 text-base sm:text-lg">调整设置</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* 调整模式 */}
              <div>
                <Label className="mb-2 block">调整模式</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={resizeMode === 'dimension' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setResizeMode('dimension')}
                    className="text-xs"
                  >
                    指定尺寸
                  </Button>
                  <Button
                    variant={resizeMode === 'scale' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setResizeMode('scale')}
                    className="text-xs"
                  >
                    缩放比例
                  </Button>
                </div>
              </div>
              
              {resizeMode === 'dimension' ? (
                <>
                  {/* 尺寸输入 */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="width">宽度 (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="输入宽度"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">高度 (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="输入高度"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* 保持比例 */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keep-ratio">保持宽高比</Label>
                    <Switch
                      id="keep-ratio"
                      checked={keepAspectRatio}
                      onCheckedChange={setKeepAspectRatio}
                    />
                  </div>
                  
                  {/* 预设尺寸 */}
                  <div>
                    <Label className="mb-2 block">快速预设</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetSizes.map((size) => (
                        <Button
                          key={size.label}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setWidth(String(size.width));
                            setHeight(String(size.height));
                          }}
                          className="text-xs"
                        >
                          {size.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 缩放比例 */}
                  <div>
                    <Label htmlFor="scale">缩放比例 (%)</Label>
                    <Input
                      id="scale"
                      type="number"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      placeholder="输入百分比"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* 预设比例 */}
                  <div>
                    <Label className="mb-2 block">快速预设</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {presetScales.map((preset) => (
                        <Button
                          key={preset.label}
                          variant={Number(scale) === preset.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setScale(String(preset.value))}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
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
                  onClick={handleResizeAll}
                  disabled={!hasImages || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing 
                    ? '调整中...' 
                    : hasCompleted 
                      ? `重新调整 ${images.length}张` 
                      : `调整 ${images.length}张`
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
