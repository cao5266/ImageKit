import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Wand2, Download, AlertCircle, Loader2, Sparkles, Settings2, X, ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import 'img-comparison-slider';
import '@/styles/comparison-slider.css';

// 声明 Web Component 类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'img-comparison-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalUrl?: string;
  processedUrl?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export function RemoveWatermark() {
  const { user } = useAuthStore();
  
  // 批量处理模式
  const [batchMode, setBatchMode] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // 单张模式
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '请选择图片文件';
    }
    if (file.size > 20 * 1024 * 1024) {
      return '文件大小不能超过 20MB';
    }
    return null;
  };

  // 处理文件选择（单张/批量）
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (batchMode) {
      // 批量模式
      const validFiles: ImageItem[] = [];
      
      Array.from(files).forEach((file, index) => {
        const error = validateFile(file);
        if (error) {
          console.error('验证失败:', error);
          return;
        }

        const id = `${Date.now()}-${index}`;
        const reader = new FileReader();
        
        reader.onloadend = () => {
          validFiles.push({
            id,
            file,
            previewUrl: reader.result as string,
            status: 'pending',
            progress: 0
          });

          if (validFiles.length === files.length) {
            setImages(prev => [...prev, ...validFiles]);
          }
        };
        
        reader.readAsDataURL(file);
      });
    } else {
      // 单张模式
      const file = files[0];
      const error = validateFile(file);
      
      if (error) {
        console.error('验证失败:', error);
        return;
      }

      setSelectedFile(file);
      setProcessedUrl('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理单张图片
  const handleProcess = async () => {
    if (!selectedFile || !user) {
      console.error('请先选择图片并登录');
      return;
    }

    if (user.vipLevel === 0) {
      console.error('AI 去水印功能需要升级 VIP 会员');
      return;
    }

    setIsProcessing(true);

    try {
      // 上传图片
      const uploadResult = await api.upload.uploadImage(selectedFile);
      if (!uploadResult.success) {
        throw new Error('图片上传失败');
      }

      // 调用 AI 去水印
      const processResult = await api.process.removeWatermark({
        imageUrl: uploadResult.url,
        ossPath: uploadResult.ossPath
      });

      if (processResult.success && processResult.resultUrl) {
        setProcessedUrl(processResult.resultUrl);
      } else {
        throw new Error(processResult.message || '处理失败');
      }
    } catch (err: any) {
      console.error('处理失败:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 批量处理
  const handleBatchProcess = async () => {
    if (images.length === 0 || !user) {
      console.error('请先选择图片并登录');
      return;
    }

    if (user.vipLevel === 0) {
      console.error('AI 去水印功能需要升级 VIP 会员');
      return;
    }

    // 依次处理每张图片
    for (const image of images) {
      if (image.status === 'completed') continue;

      try {
        // 更新为上传中
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'uploading' as const, progress: 30 } : img
        ));

        // 上传图片
        const uploadResult = await api.upload.uploadImage(image.file);
        if (!uploadResult.success) {
          throw new Error('上传失败');
        }

        // 更新为处理中
        setImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'processing' as const, 
            progress: 60,
            originalUrl: uploadResult.url 
          } : img
        ));

        // AI 处理
        const processResult = await api.process.removeWatermark({
          imageUrl: uploadResult.url,
          ossPath: uploadResult.ossPath
        });

        if (processResult.success && processResult.resultUrl) {
          setImages(prev => prev.map(img => 
            img.id === image.id ? { 
              ...img, 
              status: 'completed' as const, 
              progress: 100,
              processedUrl: processResult.resultUrl 
            } : img
          ));
        } else {
          throw new Error('处理失败');
        }
      } catch (err: any) {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'failed' as const, 
            error: err.message 
          } : img
        ));
      }
    }
  };

  // 移除图片
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // 下载单张结果
  const handleDownload = (url: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `removed-watermark-${Date.now()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题和设置 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI 去水印</h1>
              <p className="text-gray-600 text-sm">智能识别并移除图片中的水印</p>
            </div>
          </div>

          {/* 批量处理开关 */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <Settings2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">批量处理</span>
            <button
              onClick={() => {
                setBatchMode(!batchMode);
                setImages([]);
                setSelectedFile(null);
                setPreviewUrl('');
                setProcessedUrl('');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                batchMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  batchMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* VIP 提示 */}
        {user && user.vipLevel === 0 && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">需要 VIP 会员</p>
                <p className="text-sm text-amber-800 mt-1">
                  AI 去水印功能仅限 VIP 会员使用。
                  <button className="text-amber-600 hover:underline ml-1 font-medium">
                    立即升级 →
                  </button>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 批量模式 */}
        {batchMode ? (
          <div className="space-y-6">
            {/* 批量上传区域 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  批量上传图片
                </h2>
                {images.length > 0 && (
                  <span className="text-sm text-gray-600">
                    已选择 {images.length} 张图片
                  </span>
                )}
              </div>

              <label
                htmlFor="batch-upload"
                className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">点击或拖拽上传多张图片</p>
                  <p className="text-xs text-gray-400">支持 JPG、PNG、WEBP 格式，单张最大 20MB</p>
                </div>
                <input
                  id="batch-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                />
              </label>

              {images.length > 0 && (
                <Button
                  onClick={handleBatchProcess}
                  disabled={user?.vipLevel === 0 || images.every(img => img.status === 'completed')}
                  className="w-full h-12 mt-4 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  开始批量处理
                </Button>
              )}
            </Card>

            {/* 批量图片列表 */}
            {images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="p-4">
                    <div className="relative mb-3">
                      {image.status === 'completed' && image.originalUrl && image.processedUrl ? (
                        // 显示对比滑块
                        <div className="rounded-lg overflow-hidden relative" style={{ height: '192px' }}>
                          <img-comparison-slider className="w-full h-full">
                            <img slot="first" src={image.originalUrl} alt="原图" className="w-full h-full object-contain" />
                            <img slot="second" src={image.processedUrl} alt="处理后" className="w-full h-full object-contain" />
                          </img-comparison-slider>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">原图</div>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">处理后</div>
                        </div>
                      ) : (
                        // 显示预览或加载状态
                        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.previewUrl}
                            alt="Preview"
                            className={`w-full h-full object-contain ${
                              image.status === 'uploading' || image.status === 'processing' ? 'opacity-50' : ''
                            }`}
                          />
                          
                          {/* 加载状态覆盖层 */}
                          {(image.status === 'uploading' || image.status === 'processing') && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                              <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                              <p className="text-white text-sm font-medium">
                                {image.status === 'uploading' ? '上传中...' : 'AI 处理中...'}
                              </p>
                              <p className="text-white text-xs mt-1">{image.progress}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 删除按钮 */}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* 状态徽章 */}
                      <div className="absolute top-2 left-2">
                        {image.status === 'completed' && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            已完成
                          </span>
                        )}
                        {image.status === 'failed' && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                            失败
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 文件信息 */}
                    <p className="text-xs text-gray-600 truncate mb-2">
                      {image.file.name}
                    </p>

                    {/* 操作按钮 */}
                    {image.status === 'completed' && image.processedUrl && (
                      <Button
                        onClick={() => handleDownload(image.processedUrl!, image.file.name)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                    )}

                    {image.error && (
                      <p className="text-xs text-red-600 mt-2">{image.error}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // 单张模式 - 单列布局
          <div className="max-w-5xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                AI 去水印
              </h2>

              {/* 图片展示区域 */}
              {!selectedFile ? (
                // 上传区域
                <label
                  htmlFor="single-upload"
                  className="block w-full h-96 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-base text-gray-600 mb-2">点击或拖拽上传图片</p>
                    <p className="text-sm text-gray-400">支持 JPG、PNG、WEBP 格式，最大 20MB</p>
                  </div>
                  <input
                    id="single-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : isProcessing ? (
                // 处理中状态
                <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <p className="text-lg text-gray-600 font-medium">AI 正在处理中...</p>
                  <p className="text-sm text-gray-400 mt-2">这可能需要 10-30 秒</p>
                </div>
              ) : processedUrl && previewUrl ? (
                // 显示对比滑块（使用本地预览图作为原图）
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <img-comparison-slider className="w-full" style={{ aspectRatio: 'auto' }}>
                    <img slot="first" src={previewUrl} alt="原图" className="w-full" />
                    <img slot="second" src={processedUrl} alt="处理后" className="w-full" />
                  </img-comparison-slider>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg font-medium">原图</div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-sm px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    处理后
                  </div>
                </div>
              ) : (
                // 已上传但未处理
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <img src={previewUrl} alt="Preview" className="w-full" />
                </div>
              )}


              {/* 操作按钮 */}
              <div className="mt-4 space-y-3">
                {!processedUrl ? (
                  // 处理按钮
                  <Button
                    onClick={handleProcess}
                    disabled={!selectedFile || isProcessing || user?.vipLevel === 0}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI 处理中...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        开始去水印
                      </>
                    )}
                  </Button>
                ) : (
                  // 下载和重新上传按钮
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDownload(processedUrl)}
                      className="h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      下载结果
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        setProcessedUrl('');
                      }}
                      variant="outline"
                      className="h-12 text-base font-medium"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      重新上传
                    </Button>
                  </div>
                )}
              </div>

            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
