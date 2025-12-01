// 图片裁剪页面

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
  // 图片相关状态
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [originalFileType,setOriginalFileType] = useState<string>('image/png');
  
  // 裁剪参数
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [selectedRatio, setSelectedRatio] = useState<string>('1:1');
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // 输出格式
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [quality, setQuality] = useState(92);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 裁剪比例预设
  const ratioPresets = [
    { label: '自由', value: 'free', aspect: undefined, desc: '任意比例' },
    { label: '1:1', value: '1:1', aspect: 1, desc: '正方形' },
    { label: '16:9', value: '16:9', aspect: 16/9, desc: '宽屏' },
    { label: '4:3', value: '4:3', aspect: 4/3, desc: '标准' },
    { label: '3:2', value: '3:2', aspect: 3/2, desc: '照片' },
    { label: '9:16', value: '9:16', aspect: 9/16, desc: '竖屏' },
  ];
  
  // 图片加载完成
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

  // 切换裁剪比例
  const handleAspectChange = (newAspect: number | undefined, ratioValue: string) => {
    setSelectedRatio(ratioValue);
    setAspect(newAspect);
    
    // 如果图片已加载，立即更新裁剪框
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

  // 格式选项
  const formatOptions = [
    { value: 'original' as const, label: '原格式' },
    { value: 'jpeg' as const, label: 'JPG' },
    { value: 'png' as const, label: 'PNG' },
    { value: 'webp' as const, label: 'WebP' },
  ];

  // 上传图片
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFile(file);
  };

  // 加载图片文件
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

  // 拖拽上传
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

  // 生成裁剪后的图片
  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 如果有旋转，需要先旋转整个图片
    if (rotation !== 0) {
      const rotRad = (rotation * Math.PI) / 180;
      
      // 计算旋转后的画布大小
      const rotatedWidth = Math.abs(image.naturalWidth * Math.cos(rotRad)) + 
                           Math.abs(image.naturalHeight * Math.sin(rotRad));
      const rotatedHeight = Math.abs(image.naturalWidth * Math.sin(rotRad)) + 
                            Math.abs(image.naturalHeight * Math.cos(rotRad));
      
      // 创建临时画布用于旋转
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = rotatedWidth;
      tempCanvas.height = rotatedHeight;
      
      // 将原点移到画布中心，旋转，然后绘制
      tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
      tempCtx.rotate(rotRad);
      tempCtx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2
      );
      
      // 从旋转后的图片中裁剪
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
      // 没有旋转，直接裁剪
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

  // 执行裁剪
  const handleCrop = async () => {
    const croppedImageUrl = await generateCroppedImage();
    if (croppedImageUrl) {
      setCroppedImage(croppedImageUrl);
    }
  };

  // 下载裁剪后的图片
  const handleDownload = async () => {
    if (!croppedImage) return;

    try {
      const response = await fetch(croppedImage);
      let blob = await response.blob();

      // 转换格式
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
      console.error('下载失败:', error);
    }
  };

  // 重新裁剪（返回裁剪器）
  const handleReCrop = () => {
    setCroppedImage(null);
  };

  // 重置（完全清空）
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">图片裁剪</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          可视化裁剪框，精确控制裁剪区域，支持格式转换
        </p>
      </div>
      
      <div className="flex flex-col lg:grid gap-4 sm:gap-6" style={{ gridTemplateColumns: imageSrc ? '1fr 3fr' : '1fr' }}>
        {/* 工具面板 */}
        {imageSrc && (
        <div className="order-first">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-bold mb-4 text-base sm:text-lg">裁剪设置</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* 裁剪比例 */}
              <div>
                <Label className="mb-2">裁剪比例</Label>
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

              {/* 缩放 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>缩放</Label>
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

              {/* 旋转 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>旋转</Label>
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

              {/* 输出格式 */}
              <div>
                <Label className="mb-2">输出格式</Label>
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

              {/* 质量调节 */}
              {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>输出质量</Label>
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

              {/* 操作按钮 */}
              <div className="space-y-2">
                {!croppedImage ? (
                  <Button
                    onClick={handleCrop}
                    className="w-full"
                    size="lg"
                  >
                    执行裁剪
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载图片
                    </Button>
                    <Button
                      onClick={handleReCrop}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      重新裁剪
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </div>
        )}
        
        {/* 主内容区 */}
        <div className={imageSrc ? '' : 'col-span-full'}>
          {!imageSrc ? (
            // 空状态
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
                <h3 className="text-xl font-semibold mb-2">请上传图片</h3>
                <p className="text-muted-foreground mb-2">
                  支持 JPG、PNG、WebP 等常见格式
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  点击选择文件或拖拽文件到此处
                </p>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  选择图片
                </Button>
              </Card>
            </>
          ) : !croppedImage ? (
            // 裁剪器
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
                  alt="待裁剪图片"
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
            // 裁剪结果
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">裁剪结果</h3>
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
