// Image Crop Page

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { downloadFile } from '@/utils/downloadHelper';
import { Upload, Download, RotateCw, Trash2 } from 'lucide-react';
import cropBgImage from '@/assets/cropBg.png';

export function Crop() {
  // Image related states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [_originalFileType, setOriginalFileType] = useState<string>('image/png');
  
  // Crop parameters
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Output format
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [quality, setQuality] = useState(92);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Crop ratio presets
  const ratioPresets = [
    { label: 'Free', value: 'free', aspect: undefined, desc: 'Any ratio' },
    { label: '1:1', value: '1:1', aspect: 1, desc: 'Square' },
    { label: '16:9', value: '16:9', aspect: 16/9, desc: 'Widescreen' },
    { label: '4:3', value: '4:3', aspect: 4/3, desc: 'Standard' },
    { label: '3:2', value: '3:2', aspect: 3/2, desc: 'Photo' },
    { label: '9:16', value: '9:16', aspect: 9/16, desc: 'Portrait' },
  ];
  
  // Image loaded
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  // Change crop ratio
  const handleAspectChange = (newAspect: number | undefined, ratioValue: string) => {
    setSelectedRatio(ratioValue);
    setAspect(newAspect);
    
    // If image loaded, update crop immediately
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          newAspect || 1,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    }
  };

  // Format options
  const formatOptions = [
    { value: 'original' as const, label: 'Original' },
    { value: 'jpeg' as const, label: 'JPG' },
    { value: 'png' as const, label: 'PNG' },
    { value: 'webp' as const, label: 'WebP' },
  ];

  // Upload image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFile(file);
  };

  // Load image file
  const loadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setFileName(file.name);
      setOriginalFileType(file.type);
      setCroppedImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setRotation(0);
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  };

  // Generate cropped image
  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // If rotation exists, rotate the whole image first
    if (rotation !== 0) {
      const rotRad = (rotation * Math.PI) / 180;
      
      // Calculate canvas size after rotation
      const rotatedWidth = Math.abs(image.naturalWidth * Math.cos(rotRad)) + 
                           Math.abs(image.naturalHeight * Math.sin(rotRad));
      const rotatedHeight = Math.abs(image.naturalWidth * Math.sin(rotRad)) + 
                            Math.abs(image.naturalHeight * Math.cos(rotRad));
      
      // Create temp canvas for rotation
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = rotatedWidth;
      tempCanvas.height = rotatedHeight;
      
      // Move origin to center, rotate, then draw
      tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
      tempCtx.rotate(rotRad);
      tempCtx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2
      );
      
      // Crop from rotated image
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        tempCanvas,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      // No rotation, crop directly
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    return canvas.toDataURL('image/png');
  };

  // Execute crop
  const handleCrop = async () => {
    const croppedImageUrl = await generateCroppedImage();
    if (croppedImageUrl) {
      setCroppedImage(croppedImageUrl);
    }
  };

  // Download cropped image
  const handleDownload = async () => {
    if (!croppedImage) return;

    try {
      const response = await fetch(croppedImage);
      let blob = await response.blob();

      // Convert format
      if (outputFormat !== 'original') {
        const img = new Image();
        img.src = croppedImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const mimeType = `image/${outputFormat === 'jpeg' ? 'jpeg' : outputFormat}`;
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            mimeType,
            quality / 100
          );
        });
      }

      const ext = outputFormat === 'original' 
        ? fileName.split('.').pop()
        : outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      downloadFile(blob, `${nameWithoutExt}_cropped.${ext}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Re-crop
  const handleReCrop = () => {
    setCroppedImage(null);
  };

  // Reset
  const handleReset = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setFileName('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setScale(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Image Crop</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visual crop tool with precise control, supports format conversion
        </p>
      </div>
      
      <div className="flex flex-col lg:grid gap-4 sm:gap-6" style={{ gridTemplateColumns: imageSrc ? '1fr 3fr' : '1fr' }}>
        {/* Tool panel */}
        {imageSrc && (
        <div className="order-first">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-bold mb-4 text-base sm:text-lg">Crop Settings</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Aspect ratio */}
              <div>
                <Label className="mb-2">Aspect Ratio</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ratioPresets.map((ratio) => (
                    <Button
                      key={ratio.value}
                      variant={selectedRatio === ratio.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAspectChange(ratio.aspect, ratio.value)}
                      className="text-xs flex flex-col h-auto py-2"
                    >
                      <span className="font-bold">{ratio.label}</span>
                      <span className="text-[10px] text-muted-foreground">{ratio.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Scale</Label>
                  <span className="text-sm text-muted-foreground">{scale.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[scale]}
                  onValueChange={(val) => setScale(val[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Rotation</Label>
                  <span className="text-sm text-muted-foreground">{rotation}°</span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={(val) => setRotation(val[0])}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>

              {/* Output format */}
              <div>
                <Label className="mb-2">Output Format</Label>
                <div className="grid grid-cols-2 gap-2">
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
              </div>

              {/* Quality adjustment */}
              {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Output Quality</Label>
                    <span className="text-sm font-bold text-primary">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={(val) => setQuality(val[0])}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {!croppedImage ? (
                  <Button
                    onClick={handleCrop}
                    className="w-full"
                    size="lg"
                  >
                    Execute Crop
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                    <Button
                      onClick={handleReCrop}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Re-crop
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
        )}
        
        {/* Main content */}
        <div className={imageSrc ? '' : 'col-span-full'}>
          {!imageSrc ? (
            // Empty state
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Card 
                className="p-12 flex flex-col items-center justify-center text-center min-h-[500px] border-2 border-dashed cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
                <p className="text-muted-foreground mb-2">
                  Supports JPG, PNG, WebP and other formats
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click to select or drag file here
                </p>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
              </Card>
            </>
          ) : !croppedImage ? (
            // Crop editor
            <Card 
              className="p-4 overflow-hidden"
              style={{
                backgroundImage: `url(${cropBgImage})`,
                backgroundRepeat: 'repeat'
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  src={imageSrc!}
                  alt="Image to crop"
                  onLoad={onImageLoad}
                  className="max-w-full"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                />
              </ReactCrop>
            </Card>
          ) : (
            // Crop result
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Crop Result</h3>
                <span className="text-sm text-muted-foreground">{fileName}</span>
              </div>
              <div className="flex items-center justify-center bg-muted rounded-lg p-4">
                <img
                  src={croppedImage!}
                  alt="Cropped"
                  className="max-w-full max-h-[600px] object-contain"
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
