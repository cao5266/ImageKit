import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB 连接成功');
    console.log(`📊 数据库: ${mongoose.connection.name}`);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB 断开连接');
    });

  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

export default connectDB;
