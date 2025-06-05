require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');// 日志中间件
//const helmet = require('helmet');// 安全中间件
const connectDB = require('./config/db'); // 引入数据库连接

const app = express();
const port = process.env.PORT || 3000;


// 中间件
app.use(morgan('dev')); // 日志记录中间件
//app.use(helmet()); // 安全中间件
app.use(cors()); // 允许跨域
/*
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));*/
/*const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 每窗口期限制 100 次请求
  message: { error: '请求过于频繁，请稍后再试' }
}));*/

app.use(express.json({ limit: '10mb' }));// 解析 JSON 请求体,限制为 10MB
// 解析 URL 编码的请求体,限制为 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));



// 路由
app.use('/api/notes', require('./routes/notes'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/update', require('./routes/update'));

// 404 处理
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: '请求正文过大，请确保数据小于 10MB' });
  }
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});



// 启动应用并连接 MongoDB
const startApp = async () => {
  await connectDB(); // 连接数据库
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

// 执行启动
startApp().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});