const Tag = require('../models/Tag');
const Note = require('../models/Note');

exports.getAllTags = async (req, res) => {//获取所有标签
  try {
    const tags = await Tag.find().populate('parentId');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTagById = async (req, res) => {//获取单个标签
  // 根据 ID 获取单个标签，使用 populate 方法填充 parentId 和 stopper 字段
  try {
    const tag = await Tag.findById(req.params.id).populate('parentId');
    const notes = await Note.find({ tag: req.params.id }, '_id');
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json({tag,notes});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * 生成唯一标签名称的辅助函数
 * @param {string} baseName - 基础名称（客户端提供的标签名称，去除前后空格）
 * @param {number} attempt - 当前尝试次数（默认 0，第一次尝试使用原始名称）
 * @returns {Promise<string>} - 返回唯一的标签名称
 * @param {string} excludeId - 排除的 Tag ID（更新时忽略自身）
 * @description
 *   - 检查给定名称是否在 tags 集合中已存在。
 *   - 如果名称重复，递归生成带编号的名称（如 "Work (1)", "Work (2)"）。
 *   - 确保生成的名称符合 Tag 模型的唯一性约束（name: { unique: true }）。
 */
async function generateUniqueName(baseName, attempt = 0, excludeId = null) {
  // 根据尝试次数生成候选名称
  // attempt === 0: 使用原始名称（如 "Work"）
  // attempt > 0: 添加后缀（如 "Work (1)", "Work (2)"）
  let newName = attempt === 0 ? baseName : `${baseName}(${attempt})`;
  const query = { name: newName };
  if (excludeId) {
    query._id = { $ne: excludeId }; // 排除当前 Tag
    //使用 $ne（不等于）操作符，确保不将当前 Tag 的 name 视为重复。
  }
  // 查询 tags 集合，检查名称是否已存在
  // 使用 Tag.findOne 查找 name 匹配的文档
  const existingTag = await Tag.findOne(query);

  // 如果找到同名标签，名称重复
  // 递归调用，增加 attempt（尝试下一个编号）
  if (existingTag) {
    return generateUniqueName(baseName, attempt + 1, excludeId);
  }

  // 名称唯一，返回候选名称
  return newName;
}


/**
 * 创建标签的控制器
 * @param {Object} req - Express 请求对象，包含客户端发送的数据（req.body）
 * @param {Object} res - Express 响应对象，用于返回结果
 * @returns {Promise<void>} - 无返回值，通过 res 返回 JSON 响应
 * @description
 *   - 从 req.body 获取 name 和 parentId，创建新的 Tag 文档。
 *   - 使用 generateUniqueName 处理名称重复，确保 name 唯一。
 *   - 保存 Tag 文档，返回 201 状态码和保存的文档。
 *   - 捕获错误（如验证失败、数据库错误），返回 400 状态码。
 * @example
 *   POST /tags
 *   Request: { "name": "Work", "parentId": null }
 *   Response (if "Work" exists): { "_id": "...", "name": "Work (1)", "parentId": null, ... }
 */
exports.createTag = async (req, res) => {
  try {
    // 获取唯一名称
    // 使用 generateUniqueName 检查 req.body.name 是否重复
    // req.body.name.trim() 去除前后空格，与 tagSchema 的 trim: true 一致
    const uniqueName = await generateUniqueName(req.body.name.trim());

    // 创建新的 Tag 文档
    // 使用唯一名称和客户端提供的 parentId（若未提供，设为 null）
    const tag = new Tag({
      name: uniqueName,
      parentId: req.body.parentId || null,
    });

    // 保存 Tag 文档到数据库
    // tag.save() 触发 Mongoose 的验证和唯一索引检查
    const savedTag = await tag.save();

    // 返回 201 Created 状态码和保存的 Tag 文档
    res.status(201).json(savedTag);
  } catch (err) {
    // 捕获错误（如验证错误、数据库错误）
    // 返回 400 Bad Request 状态码和错误消息
    // 示例错误：name 为空、parentId 无效、数据库连接失败
    res.status(400).json({ message: err.message });
  }
};


/**
 * 更新标签
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
exports.updateTag = async (req, res) => {//更新标签
  try {
    // 查找 Tag
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    // 准备更新数据
    const updates = {};
    if (req.body.name) {
      // 检查和生成唯一名称，排除当前 Tag
      updates.name = await generateUniqueName(req.body.name.trim(), 0, req.params.id);
    }
    if (req.body.parentId !== undefined) {
      updates.parentId = req.body.parentId;
    }
    updates.updatedAt = Date.now();

    // 更新 Tag
    Object.assign(tag, updates);
    const updatedTag = await tag.save();

    // 返回更新后的 Tag
    res.json(updatedTag);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tag name already exists' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Tag ID' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;

    // 验证标签是否存在
    const tag = await Tag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    // 递归获取所有子标签的 ID（包括目标标签）
    const getAllChildTagIds = async (parentId) => {
      const childTags = await Tag.find({ parentId }).select('_id');
      let allTagIds = [parentId];
      for (const childTag of childTags) {
        const childIds = await getAllChildTagIds(childTag._id);
        allTagIds = allTagIds.concat(childIds);
      }
      return allTagIds;
    };

    // 获取目标标签及其所有子标签的 ID
    const tagIdsToDelete = await getAllChildTagIds(tagId);

    // 删除所有相关标签
    await Tag.deleteMany({ _id: { $in: tagIdsToDelete } });

    // 删除所有相关笔记（tag 字段引用了这些标签的笔记）
    await Note.deleteMany({ tag: { $in: tagIdsToDelete } });

    res.json({ message: 'Tag, its child tags, and related notes deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTagTree = async (req, res) => {//获取标签树
  // 获取所有标签并构建树形结构
  try {
    //获取所有文件夹内容
    const tags = await Tag.find()
      .select('name parentId') // 只返回 name 和 parentId
      .populate({
        path: 'parentId',
        select: 'name' // 限制填充的 parentId 字段，只返回 name
      });

    // 使用 Map 存储标签
    const tagMap = {};
    tags.forEach(tag => {//遍历所有标签
      tagMap[tag._id] = { ...tag.toObject(), children: [] };//将标签转换为对象并添加 children 属性
    });


    const tree = [];//初始化树形结构
    // 构建树形结构
    tags.forEach(tag => {//遍历所有标签
      // 如果标签有父标签，则将其添加到父标签的 children 数组中，否则添加到根节点
      // tag.parentId 是 ObjectId 类型，tag._id 是 ObjectId 类型，直接比较即可
      if (tag.parentId) {
        const { parentId, ...childTag } = tagMap[tag._id];//解构标签对象，去除 parentId 属性,并保留其他属性为 childTag
        tagMap[tag.parentId._id].children.push(childTag);//将子标签添加到父标签的 children 数组中
      } else {
        tree.push(tagMap[tag._id]);
      }
    });

    res.json(tree);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTagNoteTree = async (req, res) => {//获取文件夹和笔记树型结构
  // 获取所有标签并构建树形结构
  try {
    //获取所有笔记内容
    const notes = await Note.find().select('title tag');//获取所有笔记的标题和标签 
    //存储笔记内容
    const tagToNotes = {};
    notes.forEach(note => {//遍历所有笔记
      // 仅存储匹配的第一个笔记的 title
      if (!tagToNotes[note.tag]) {
        tagToNotes[note.tag] = [];
      }
      tagToNotes[note.tag].push(note);
    });

    //获取所有文件夹内容
    const tags = await Tag.find()
      .select('name parentId') // 只返回 name 和 parentId
      .populate({
        path: 'parentId',
        select: 'name' // 限制填充的 parentId 字段，只返回 name
      });

    // 使用 Map 存储标签
    const tagMap = {};
    tags.forEach(tag => {//遍历所有标签
      tagMap[tag._id] = { ...tag.toObject(), children: [], notes: tagToNotes[tag._id] || [] };//将标签转换为对象并添加 children 属性
    });


    const tree = [];//初始化树形结构
    // 构建树形结构
    tags.forEach(tag => {//遍历所有标签
      // 如果标签有父标签，则将其添加到父标签的 children 数组中，否则添加到根节点
      // tag.parentId 是 ObjectId 类型，tag._id 是 ObjectId 类型，直接比较即可
      if (tag.parentId) {
        const { parentId, ...childTag } = tagMap[tag._id];//解构标签对象，去除 parentId 属性,并保留其他属性为 childTag
        tagMap[tag.parentId._id].children.push(childTag);//将子标签添加到父标签的 children 数组中
      } else {
        tree.push(tagMap[tag._id]);
      }
    });

    res.json(tree);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// API：根据文件夹 ID 获取顶级文件夹的ID
exports.getTopLevelFolderTree = async (req, res) => {
  try {
    const { id } = req.params; // 从请求参数获取文件夹 ID
    // 步骤 1：判断 ID 文件夹是否存在
    let startingTagId = null;
    //在文件夹集合中查找id是否为标签，并返回父标签id
    const tag = await Tag.findById(id).select('parentId');
    //如果查询为ture，说明查询内容为标签，且非顶级文件夹
    if (tag) {
      // 如果 ID 是标签，直接使用其 ID 作为起点，查找顶级文件夹
      startingTagId = tag._id;
      // 如果 ID 不是标签，报错
    } else {
      return res.status(404).json({ message: '文件夹未找到' });
    }
    // 步骤 2：通过 parentId 向上查找顶级文件夹
    let currentTag = await Tag.findById(startingTagId).select('parentId');
    if (!currentTag) {
      return res.status(404).json({ message: '起始标签未找到' });
    }
    //循环判定通过 parentId 向上查找顶级文件夹
    while (currentTag.parentId) {
      currentTag = await Tag.findById(currentTag.parentId).select('parentId');
      if (!currentTag) {
        return res.status(404).json({ message: '父标签未找到' });
      }
    }
    const topLevelTagId = currentTag._id;

    res.json(currentTag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};