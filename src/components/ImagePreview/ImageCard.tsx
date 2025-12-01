// Image preview card component

import { X, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useImageStore } from '@/store/imageStore';
import { formatFileSize } from '@/utils/fileValidator';
import type { ProcessedImage } from '@/types/image';

interface ImageCardProps {
  image: ProcessedImage;
  onDownload?: (imageId: string) => void;
}

export function ImageCard({ image, onDownload }: ImageCardProps) {
  const removeImage = useImageStore(state => state.removeImage);
  
  return (
    <Card className="p-3 sm:p-4 relative group">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {/* Download button - only show after processing */}
        {image.status === 'completed' && onDownload && (
          <Button
            variant="secondary"
            size="icon"
            className="w-7 h-7 sm:w-8 sm:h-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            onClick={() => onDownload(image.id)}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
        
        {/* Delete button */}
        <Button
          variant="destructive"
          size="icon"
          className="w-7 h-7 sm:w-8 sm:h-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(image.id)}
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
      
      {/* Image preview */}
      <div className="aspect-square bg-gray-100 rounded-md mb-2 sm:mb-3 overflow-hidden">
        <img
          src={image.processedUrl || image.originalUrl}
          alt={image.originalFile.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* File info */}
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-xs sm:text-sm font-medium truncate" title={image.originalFile.name}>
          {image.originalFile.name}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] sm:text-xs">{formatFileSize(image.originalSize)}</span>
          
          {image.status === 'completed' && image.compressionRatio && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 py-0">
              -{image.compressionRatio.toFixed(0)}%
            </Badge>
          )}
          
          {image.status === 'processing' && (
            <Badge className="text-[10px] sm:text-xs px-1.5 py-0">Processing</Badge>
          )}
          
          {image.status === 'error' && (
            <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 py-0">Failed</Badge>
          )}
        </div>
        
        {/* Processing progress */}
        {image.status === 'processing' && (
          <Progress value={50} className="h-1" />
        )}
        
        {/* Processed size */}
        {image.status === 'completed' && image.processedSize && (
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            Processed: {formatFileSize(image.processedSize)}
          </div>
        )}
      </div>
    </Card>
  );
}
