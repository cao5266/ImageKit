// 图片列表项组件（列表视图）

import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useImageStore } from '@/store/imageStore';
import { formatFileSize } from '@/utils/fileValidator';
import type { ProcessedImage } from '@/types/image';

interface ImageListItemProps {
  image: ProcessedImage;
  onDownload?: (imageId: string) => void;
}

export function ImageListItem({ image, onDownload }: ImageListItemProps) {
  const removeImage = useImageStore(state => state.removeImage);
  
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      {/* 缩略图 */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        <img
          src={image.processedUrl || image.originalUrl}
          alt={image.originalFile.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm sm:text-base truncate mb-1" title={image.originalFile.name}>
          {image.originalFile.name}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span>原始: {formatFileSize(image.originalSize)}</span>
          
          {image.status === 'completed' && image.processedSize && (
            <>
              <span>→</span>
              <span className="text-primary font-medium">
                {formatFileSize(image.processedSize)}
              </span>
            </>
          )}
          
          {image.status === 'completed' && image.compressionRatio && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              省 {image.compressionRatio.toFixed(0)}%
            </Badge>
          )}
          
          {image.status === 'processing' && (
            <Badge className="text-xs">处理中...</Badge>
          )}
          
          {image.status === 'error' && (
            <Badge variant="destructive" className="text-xs">失败</Badge>
          )}
        </div>
        
        {/* 处理进度 */}
        {image.status === 'processing' && (
          <Progress value={50} className="h-1 mt-2" />
        )}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-1 flex-shrink-0">
        {/* 下载按钮 */}
        {image.status === 'completed' && onDownload && (
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 sm:w-9 sm:h-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            onClick={() => onDownload(image.id)}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        
        {/* 删除按钮 */}
        <Button
          variant="destructive"
          size="icon"
          className="w-8 h-8 sm:w-9 sm:h-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(image.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
