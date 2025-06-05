const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  description: {// 更新描述，
    type: String,
    trim: true
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  strict: 'throw' // 禁止未定义字段
});

module.exports = mongoose.model('Update', updateSchema);