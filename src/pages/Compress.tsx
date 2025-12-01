// Image Compression Page

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
  
  // Compression presets
  const presets = [
    { label: 'High', quality: 90, desc: 'Light compression, preserve quality' },
    { label: 'Medium', quality: 80, desc: 'Balance quality and size' },
    { label: 'Low', quality: 60, desc: 'Maximum compression, web optimized' },
  ];
  
  // Output format options
  const formatOptions = [
    { value: 'original' as const, label: 'Original' },
    { value: 'jpeg' as const, label: 'JPG' },
    { value: 'png' as const, label: 'PNG' },
    { value: 'webp' as const, label: 'WebP' },
  ];
  
  // Compress single image
  const handleCompressSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    try {
      updateImage(imageId, { status: 'processing' });
      
      // Compress to target format directly
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
        error: error instanceof Error ? error.message : 'Compression failed'
      });
    }
  };
  
  // Batch compress all images
  const handleCompressAll = async () => {
    if (images.length === 0) return;
    
    setProcessing(true);
    
    try {
      // Compress all images, including completed ones
      for (const image of images) {
        await handleCompressSingle(image.id);
      }
    } finally {
      setProcessing(false);
    }
  };
  
  // Download single image
  const handleDownloadSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.processedUrl) return;
    
    try {
      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      
      // Modify file extension
      const originalName = image.originalFile.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      const newExt = outputFormat === 'original' ? 
        originalName.substring(originalName.lastIndexOf('.')) :
        `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`;
      
      downloadFile(blob, `${nameWithoutExt}${newExt}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  // Batch download all images
  const handleDownloadAll = async () => {
    const completedImages = images.filter(
      img => img.status === 'completed' && img.processedUrl
    );
    
    if (completedImages.length === 0) return;
    
    const files = await Promise.all(
      completedImages.map(async (img) => {
        const response = await fetch(img.processedUrl!);
        const blob = await response.blob();
        
        // Modify file extension
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Image Compression</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Reduce file size while maintaining quality, batch processing supported
          </p>
        </div>
        
        {/* View mode toggle */}
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
        {/* Tool panel */}
        <div className="lg:col-span-1 order-first">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-bold mb-4 text-base sm:text-lg">Compression Settings</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Quick presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Presets</label>
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
                  {presets.find(p => p.quality === quality)?.desc || 'Custom quality'}
                </p>
              </div>
              
              {/* Output format */}
              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
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
                  💡 The displayed size is the final {outputFormat === 'original' ? 'original format' : outputFormat.toUpperCase()} size
                </p>
              </div>
              
              {/* Quality slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Fine Tune</label>
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
                    ? '💡 Click "Re-compress" after changing parameters' 
                    : 'Recommended 80% (similar to TinyPNG)'
                  }
                </p>
              </div>
              
              {/* Statistics */}
              {hasImages && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{images.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">{completedCount}</span>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleCompressAll}
                  disabled={!hasImages || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing 
                    ? 'Compressing...' 
                    : hasCompleted 
                      ? `Re-compress ${images.length} images` 
                      : `Compress ${images.length} images`
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
                    <span>Download ({completedCount})</span>
                  </Button>
                  
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    disabled={!hasImages}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {!hasImages ? (
            <Dropzone />
          ) : viewMode === 'grid' ? (
            // Grid view
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
            // List view
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
