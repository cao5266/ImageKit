// Image Watermark Page

import { useState } from 'react';
import { Dropzone } from '@/components/ImageUploader/Dropzone';
import { ImageCard } from '@/components/ImagePreview/ImageCard';
import { ImageListItem } from '@/components/ImagePreview/ImageListItem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useImageStore } from '@/store/imageStore';
import { addWatermark } from '@/utils/watermarkProcessor';
import { downloadFile, downloadAsZip } from '@/utils/downloadHelper';
import { Download, Trash2, Grid3x3, List, Type, Image as ImageIcon } from 'lucide-react';

export function Watermark() {
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('Watermark Text');
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [opacity, setOpacity] = useState(80);
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [watermarkScale, setWatermarkScale] = useState(30);
  const [offsetX, setOffsetX] = useState(20);
  const [offsetY, setOffsetY] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const images = useImageStore(state => state.images);
  const updateImage = useImageStore(state => state.updateImage);
  const clearAll = useImageStore(state => state.clearAll);
  
  // Position presets
  const positionOptions = [
    { value: 'top-left' as const, label: 'Top Left' },
    { value: 'top-right' as const, label: 'Top Right' },
    { value: 'bottom-left' as const, label: 'Bottom Left' },
    { value: 'bottom-right' as const, label: 'Bottom Right' },
    { value: 'center' as const, label: 'Center' },
  ];
  
  // Upload watermark image
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setWatermarkImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Add watermark to single image
  const handleAddWatermarkSingle = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    // Validate watermark content
    if (watermarkType === 'text' && !watermarkText.trim()) {
      alert('Please enter watermark text');
      return;
    }
    if (watermarkType === 'image' && !watermarkImage) {
      alert('Please upload watermark image');
      return;
    }
    
    try {
      updateImage(imageId, { status: 'processing' });
      
      const options = watermarkType === 'text' 
        ? {
            type: 'text' as const,
            text: watermarkText,
            fontSize,
            fontColor,
            position,
            opacity: opacity / 100,
            offsetX,
            offsetY,
          }
        : {
            type: 'image' as const,
            watermarkImage: watermarkImage!,
            position,
            opacity: opacity / 100,
            scale: watermarkScale / 100,
            offsetX,
            offsetY,
          };
      
      const result = await addWatermark(image.originalFile, options);
      
      updateImage(imageId, {
        status: 'completed',
        processedUrl: result.url,
        processedSize: result.size,
        compressionRatio: ((image.originalSize - result.size) / image.originalSize) * 100,
      });
    } catch (error) {
      updateImage(imageId, { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to add watermark'
      });
    }
  };
  
  // Batch add watermark
  const handleAddWatermarkAll = async () => {
    if (images.length === 0) return;
    
    // Validate watermark content
    if (watermarkType === 'text' && !watermarkText.trim()) {
      alert('Please enter watermark text');
      return;
    }
    if (watermarkType === 'image' && !watermarkImage) {
      alert('Please upload watermark image');
      return;
    }
    
    setProcessing(true);
    
    try {
      for (const image of images) {
        await handleAddWatermarkSingle(image.id);
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
      downloadFile(blob, image.originalFile.name);
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
        return {
          blob,
          filename: img.originalFile.name,
        };
      })
    );
    
    await downloadAsZip(files, 'watermarked-images.zip');
  };
  
  const completedCount = images.filter(img => img.status === 'completed').length;
  const hasImages = images.length > 0;
  const hasCompleted = completedCount > 0;
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Add Watermark</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Add text or image watermark to protect copyright
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
            <h2 className="font-bold mb-4 text-base sm:text-lg">Watermark Settings</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Watermark type */}
              <div>
                <Label className="mb-2 block">Watermark Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={watermarkType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWatermarkType('text')}
                    className="text-xs"
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Text
                  </Button>
                  <Button
                    variant={watermarkType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWatermarkType('image')}
                    className="text-xs"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                </div>
              </div>
              
              {/* Text watermark settings */}
              {watermarkType === 'text' && (
                <>
                  <div>
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{fontSize}px</span>
                    </div>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(val) => setFontSize(val[0])}
                      min={12}
                      max={120}
                      step={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="font-color">Font Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="font-color"
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Image watermark settings */}
              {watermarkType === 'image' && (
                <>
                  <div>
                    <Label htmlFor="watermark-image">Watermark Image</Label>
                    <Input
                      id="watermark-image"
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkImageUpload}
                      className="mt-1"
                    />
                    {watermarkImage && (
                      <div className="mt-2 p-2 bg-muted rounded-lg">
                        <img 
                          src={watermarkImage} 
                          alt="Watermark preview" 
                          className="max-w-full h-20 object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Watermark Size</Label>
                      <span className="text-sm text-muted-foreground">{watermarkScale}%</span>
                    </div>
                    <Slider
                      value={[watermarkScale]}
                      onValueChange={(val) => setWatermarkScale(val[0])}
                      min={10}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended 30-50%
                    </p>
                  </div>
                </>
              )}
              
              {/* Common settings */}
              <div>
                <Label className="mb-2 block">Watermark Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  {positionOptions.map((pos) => (
                    <Button
                      key={pos.value}
                      variant={position === pos.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPosition(pos.value)}
                      className="text-xs"
                    >
                      {pos.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opacity</Label>
                  <span className="text-sm text-muted-foreground">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={(val) => setOpacity(val[0])}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="offset-x">Horizontal Offset</Label>
                  <Input
                    id="offset-x"
                    type="number"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="offset-y">Vertical Offset</Label>
                  <Input
                    id="offset-y"
                    type="number"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
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
                  onClick={handleAddWatermarkAll}
                  disabled={!hasImages || processing}
                  className="w-full"
                  size="lg"
                >
                  {processing 
                    ? 'Processing...' 
                    : hasCompleted 
                      ? `Re-add ${images.length} images` 
                      : `Add Watermark ${images.length} images`
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
