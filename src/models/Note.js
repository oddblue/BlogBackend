//笔记模型
// 该模型用于存储笔记的标题、内容、标签、创建时间、更新时间和元数据
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {// 笔记标题，用户可以自定义，或者使用传递md文件的文件名
    type: String,
    required: true,
  },
  content: {// 笔记内容，根据用户传递的md文件生成
    type: String,
    required: true,
  },
  tag: {// 笔记标签，用户可以自定义，或使用已经存在的标签
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  },
  metadata: {//嵌套对象，笔记元数据，用户可以自定义，方便后续扩展
    description: {// 笔记描述，用户可以自定义
      type: String,
      default: '',
    },
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  strict: 'throw' // 禁止未定义字段
});

module.exports = mongoose.model('Note', noteSchema);