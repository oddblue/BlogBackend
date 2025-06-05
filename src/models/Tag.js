//标签模型
// 该模型用于存储标签信息，包括标签名称、父标签ID、创建时间和更新时间等字段
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {//名称
    type: String,
    required: true,
    unique: true,//使用unique: true，会自动创建索引
    trim: true,//去除前后空格
    minlength: 1,//最小长度为1
  },
  parentId: {//父标签ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    default: null,
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  strict: 'throw' // 禁止未定义字段
});

// 添加唯一索引，索引基于 Tag 文档的 name 字段，1：表示升序索引，索引是唯一的，即 name 字段的值在 Tag 集合中不能重复
//tagSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);