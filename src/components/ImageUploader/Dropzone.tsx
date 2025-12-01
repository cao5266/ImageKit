// Drag and drop upload component

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useImageStore } from '@/store/imageStore';
import { validateImageFiles } from '@/utils/fileValidator';
import { cn } from '@/lib/utils';

export function Dropzone() {
  const addImages = useImageStore(state => state.addImages);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const { valid, invalid } = validateImageFiles(acceptedFiles);
    
    if (valid.length > 0) {
      addImages(valid);
    }
    
    if (invalid.length > 0) {
      // TODO: Show error message
      console.error('Invalid files:', invalid);
    }
  }, [addImages]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer',
        'transition-colors duration-200 min-h-[200px] sm:min-h-[300px] flex flex-col items-center justify-center',
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-primary'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-base sm:text-lg font-medium">Drop to upload images</p>
      ) : (
        <>
          <p className="text-base sm:text-lg font-medium mb-2">Drag images here</p>
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            or click to select files (JPG, PNG, WebP supported, max 10MB)
          </p>
        </>
      )}
    </div>
  );
}
