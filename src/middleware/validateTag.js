const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Tag = require('../models/Tag');

const validateTag = [
  body('name')//要求标签名为字符串且非空
    .isString()
    .notEmpty()
    .trim()//去除前后空格
    .isLength({ min: 1 })//最小长度为1
    .withMessage('Name is required'),
  // 验证 parentId：可选（允许 null），必须是有效 ObjectId，name 不等于 req.body.name
  body('parentId')
    .optional({ nullable: true }) // 允许 null 或未提供
    .isMongoId()// 验证 parentId 是否为有效的 MongoDB ObjectId
    .withMessage('parentId must be a valid MongoDB ObjectId')
    .custom(async (value, { req }) => {
      // 如果 parentId 是 null，验证通过
      if (value === null) return true;

      // 防止 parentId 等于当前 Tag 的 _id（自引用）
      if (req.params && req.params.id && value === req.params.id) {
        throw new Error('parentId cannot reference the current tag');
      }

      // 查询 parentId 对应的 Tag
      const parentTag = await Tag.findById(value);
      if (!parentTag) {
        throw new Error('Parent tag does not exist');
      }

      // 检查父标签的 name 是否等于当前标签的 name（忽略大小写）
      if (parentTag.name.toLowerCase() === req.body.name.trim().toLowerCase()) {
        throw new Error('Parent tag cannot have the same name as the current tag');
      }

      // 定义检查循环引用的辅助函数
      // @param currentId - 当前检查的 parentId
      // @param targetId - 当前 Tag 的 _id（req.params.id）
      // @returns {Promise<boolean>} - 无循环返回 true，有循环抛出错误
      async function checkCircularReference(currentId, targetId) {
        // 如果 currentId 为空（无父标签），无循环，验证通过
        if (!currentId) return true;

        // 使用 Set 跟踪已访问的 Tag ID，检测循环
        const seen = new Set();
        let id = currentId;

        // 遍历 parentId 链
        while (id) {
          // 如果 id 已访问，说明存在循环
          if (seen.has(id)) {
            throw new Error('Circular reference detected in parentId');
          }

          // 记录当前 id
          seen.add(id);

          // 查询当前 id 对应的 Tag
          const tag = await Tag.findById(id);
          if (!tag) break; // 如果 Tag 不存在，退出循环

          // 如果当前 Tag 的 _id 等于 targetId，说明 parentId 引用了自身或其后代
          if (tag._id.toString() === targetId) {
            throw new Error('Circular reference detected: parentId cannot reference itself or its descendants');
          }

          // 继续检查父标签的 parentId
          id = tag.parentId;
        }

        // 无循环，验证通过
        return true;
      }

      // 如果存在 req.params.id（更新或获取场景），检查循环引用
      // 确保 parentId 不会导致当前 Tag 成为自己的祖先
      if (req.params && req.params.id) {
        await checkCircularReference(value, req.params.id);
      }

      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];





module.exports = validateTag;