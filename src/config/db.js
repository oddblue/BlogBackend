const mongoose = require('mongoose');
require('dotenv').config(); // 加载环境变量

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/note-app';// 默认值为本地 MongoDB 实例

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // 连接失败时退出进程
  }
};

module.exports = connectDB;