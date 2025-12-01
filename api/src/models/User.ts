import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  googleId?: string;
  avatar?: string;
  vipLevel: number;
  credits: number;
  totalCredits: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  vipLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  credits: {
    type: Number,
    default: 10
  },
  totalCredits: {
    type: Number,
    default: 10
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
