// 水印处理工具

interface TextWatermarkOptions {
  type: 'text';
  text: string;
  fontSize: number;
  fontColor: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  offsetX: number;
  offsetY: number;
}

interface ImageWatermarkOptions {
  type: 'image';
  watermarkImage: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

/**
 * 添加水印到图片
 */
export async function addWatermark(
  file: File,
  options: WatermarkOptions
): Promise<{ url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('无法创建 Canvas 上下文');
        }

        // 设置画布大小
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 保存当前状态
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = options.opacity;

        if (options.type === 'text') {
          // 添加文字水印
          await addTextWatermark(ctx, canvas, options);
        } else {
          // 添加图片水印
          await addImageWatermark(ctx, canvas, options);
        }

        // 恢复状态
        ctx.restore();

        // 转换为 Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('转换失败'));
            return;
          }

          const url = URL.createObjectURL(blob);
          resolve({
            url,
            size: blob.size,
          });
        }, file.type || 'image/png');
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 添加文字水印
 */
async function addTextWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: TextWatermarkOptions
): Promise<void> {
  const { text, fontSize, fontColor, position, offsetX, offsetY } = options;

  // 设置字体
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = fontColor;
  ctx.textBaseline = 'top';

  // 测量文字宽度
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  // 计算位置
  const { x, y } = calculatePosition(
    canvas.width,
    canvas.height,
    textWidth,
    textHeight,
    position,
    offsetX,
    offsetY
  );

  // 绘制文字
  ctx.fillText(text, x, y);
}

/**
 * 添加图片水印
 */
async function addImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: ImageWatermarkOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { watermarkImage, position, scale, offsetX, offsetY } = options;

    const watermark = new Image();
    watermark.crossOrigin = 'anonymous';

    watermark.onload = () => {
      // 计算水印大小
      const watermarkWidth = watermark.width * scale;
      const watermarkHeight = watermark.height * scale;

      // 计算位置
      const { x, y } = calculatePosition(
        canvas.width,
        canvas.height,
        watermarkWidth,
        watermarkHeight,
        position,
        offsetX,
        offsetY
      );

      // 绘制水印图片
      ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
      resolve();
    };

    watermark.onerror = () => {
      reject(new Error('水印图片加载失败'));
    };

    watermark.src = watermarkImage;
  });
}

/**
 * 计算水印位置
 */
function calculatePosition(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center',
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  switch (position) {
    case 'top-left':
      x = offsetX;
      y = offsetY;
      break;
    case 'top-right':
      x = canvasWidth - watermarkWidth - offsetX;
      y = offsetY;
      break;
    case 'bottom-left':
      x = offsetX;
      y = canvasHeight - watermarkHeight - offsetY;
      break;
    case 'bottom-right':
      x = canvasWidth - watermarkWidth - offsetX;
      y = canvasHeight - watermarkHeight - offsetY;
      break;
    case 'center':
      x = (canvasWidth - watermarkWidth) / 2 + offsetX;
      y = (canvasHeight - watermarkHeight) / 2 + offsetY;
      break;
  }

  return { x, y };
}
