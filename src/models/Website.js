const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  logo: {
    type: String, // 存储 Base64 编码的 SVG或png
    required: true
  },
  name: {// 网站名称，用户可以自定义
    type: String,
    required: true,
    trim: true
  },
  description: {// 网站描述，用户可以自定义
    type: String,
    trim: true
  },
  url: {// 网站地址，用户可以自定义
    type: String,
    required: true,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, 'Invalid URL format']
  },
  metadata: {//嵌套对象，网站元数据，用户可以自定义，方便后续扩展
    classify: {// 网站分类，用户可以自定义
      type: String,
      default: '',
    },
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  strict: 'throw' // 禁止未定义字段
});

module.exports = mongoose.model('Website', websiteSchema);