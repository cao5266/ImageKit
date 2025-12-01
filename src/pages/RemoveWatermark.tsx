import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Wand2, Download, AlertCircle, Loader2, Sparkles, Settings2, X } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import 'img-comparison-slider';
import '@/styles/comparison-slider.css';

// Declare Web Component types
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
  
  // Batch processing mode
  const [batchMode, setBatchMode] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // Single image mode
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File size cannot exceed 20MB';
    }
    return null;
  };

  // Handle file selection (single/batch)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (batchMode) {
      // Batch mode
      const validFiles: ImageItem[] = [];
      
      Array.from(files).forEach((file, index) => {
        const error = validateFile(file);
        if (error) {
          console.error('Validation failed:', error);
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
      // Single image mode
      const file = files[0];
      const error = validateFile(file);
      
      if (error) {
        console.error('Validation failed:', error);
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

  // Process single image
  const handleProcess = async () => {
    if (!selectedFile || !user) {
      console.error('Please select an image and login first');
      return;
    }

    if (user.vipLevel === 0) {
      console.error('AI watermark removal requires VIP membership');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload image
      const uploadResult = await api.upload.uploadImage(selectedFile);
      if (!uploadResult.success) {
        throw new Error('Image upload failed');
      }

      // Call AI watermark removal
      const processResult = await api.process.removeWatermark({
        imageUrl: uploadResult.url,
        ossPath: uploadResult.ossPath
      });

      if (processResult.success && processResult.resultUrl) {
        setProcessedUrl(processResult.resultUrl);
      } else {
        throw new Error(processResult.message || 'Processing failed');
      }
    } catch (err: any) {
      console.error('Processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch processing
  const handleBatchProcess = async () => {
    if (images.length === 0 || !user) {
      console.error('Please select an image and login first');
      return;
    }

    if (user.vipLevel === 0) {
      console.error('AI watermark removal requires VIP membership');
      return;
    }

    // Process each image in sequence
    for (const image of images) {
      if (image.status === 'completed') continue;

      try {
        // Update to uploading
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'uploading' as const, progress: 30 } : img
        ));

        // Upload image
        const uploadResult = await api.upload.uploadImage(image.file);
        if (!uploadResult.success) {
          throw new Error('Upload failed');
        }

        // Update to processing
        setImages(prev => prev.map(img => 
          img.id === image.id ? { 
            ...img, 
            status: 'processing' as const, 
            progress: 60,
            originalUrl: uploadResult.url 
          } : img
        ));

        // AI processing
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
          throw new Error('Processing failed');
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

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Download single result
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
        {/* Page title and settings */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Watermark Removal</h1>
              <p className="text-gray-600 text-sm">Intelligently identify and remove watermarks from images</p>
            </div>
          </div>

          {/* Batch processing toggle */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <Settings2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Batch Processing</span>
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

        {/* VIP notice */}
        {user && user.vipLevel === 0 && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">VIP Membership Required</p>
                <p className="text-sm text-amber-800 mt-1">
                  AI watermark removal is only available for VIP members.
                  <button className="text-amber-600 hover:underline ml-1 font-medium">
                    Upgrade Now →
                  </button>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Batch mode */}
        {batchMode ? (
          <div className="space-y-6">
            {/* Batch upload area */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Batch Upload Images
                </h2>
                {images.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {images.length} images selected
                  </span>
                )}
              </div>

              <label
                htmlFor="batch-upload"
                className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">Click or drag to upload multiple images</p>
                  <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP formats, max 20MB per image</p>
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
                  Start Batch Processing
                </Button>
              )}
            </Card>

            {/* Batch image list */}
            {images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="p-4">
                    <div className="relative mb-3">
                      {image.status === 'completed' && image.originalUrl && image.processedUrl ? (
                        // Show comparison slider
                        <div className="rounded-lg overflow-hidden relative" style={{ height: '192px' }}>
                          <img-comparison-slider className="w-full h-full">
                            <img slot="first" src={image.originalUrl} alt="Original" className="w-full h-full object-contain" />
                            <img slot="second" src={image.processedUrl} alt="Processed" className="w-full h-full object-contain" />
                          </img-comparison-slider>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Original</div>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Processed</div>
                        </div>
                      ) : (
                        // Show preview or loading status
                        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.previewUrl}
                            alt="Preview"
                            className={`w-full h-full object-contain ${
                              image.status === 'uploading' || image.status === 'processing' ? 'opacity-50' : ''
                            }`}
                          />
                          
                          {/* Loading overlay */}
                          {(image.status === 'uploading' || image.status === 'processing') && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                              <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                              <p className="text-white text-sm font-medium">
                                {image.status === 'uploading' ? 'Uploading...' : 'AI Processing...'}
                              </p>
                              <p className="text-white text-xs mt-1">{image.progress}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Status badge */}
                      <div className="absolute top-2 left-2">
                        {image.status === 'completed' && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                        {image.status === 'failed' && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                            Failed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* File info */}
                    <p className="text-xs text-gray-600 truncate mb-2">
                      {image.file.name}
                    </p>

                    {/* Action buttons */}
                    {image.status === 'completed' && image.processedUrl && (
                      <Button
                        onClick={() => handleDownload(image.processedUrl!, image.file.name)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
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
          // Single image mode - single column layout
          <div className="max-w-5xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                AI Watermark Removal
              </h2>

              {/* Image display area */}
              {!selectedFile ? (
                // Upload area
                <label
                  htmlFor="single-upload"
                  className="block w-full h-96 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-base text-gray-600 mb-2">Click or drag to upload image</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG, WEBP formats, max 20MB</p>
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
                // Processing status
                <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <p className="text-lg text-gray-600 font-medium">AI Processing...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take 10-30 seconds</p>
                </div>
              ) : processedUrl && previewUrl ? (
                // Show comparison slider (use local preview as original)
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <img-comparison-slider className="w-full" style={{ aspectRatio: 'auto' }}>
                    <img slot="first" src={previewUrl} alt="Original" className="w-full" />
                    <img slot="second" src={processedUrl} alt="Processed" className="w-full" />
                  </img-comparison-slider>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg font-medium">Original</div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-sm px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Processed
                  </div>
                </div>
              ) : (
                // Uploaded but not processed
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <img src={previewUrl} alt="Preview" className="w-full" />
                </div>
              )}


              {/* Action buttons */}
              <div className="mt-4 space-y-3">
                {!processedUrl ? (
                  // Process button
                  <Button
                    onClick={handleProcess}
                    disabled={!selectedFile || isProcessing || user?.vipLevel === 0}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Start Removal
                      </>
                    )}
                  </Button>
                ) : (
                  // Download and re-upload buttons
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDownload(processedUrl)}
                      className="h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Result
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
                      Re-upload
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
