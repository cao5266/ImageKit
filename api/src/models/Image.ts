import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  processedUrl?: string;
  type: 'watermark_removal' | 'inpaint' | 'background_removal' | 'crop' | 'resize';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  width?: number;
  height?: number;
  fileSize?: number;
  errorMessage?: string;
  createdAt: Date;
  processedAt?: Date;
}

const ImageSchema = new Schema<IImage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  processedUrl: {
    type: String
  },
  type: {
    type: String,
    enum: ['watermark_removal', 'inpaint', 'background_removal', 'crop', 'resize'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  width: Number,
  height: Number,
  fileSize: Number,
  errorMessage: String,
  processedAt: Date
}, {
  timestamps: true
});

// 复合索引
ImageSchema.index({ userId: 1, createdAt: -1 });
ImageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IImage>('Image', ImageSchema);
