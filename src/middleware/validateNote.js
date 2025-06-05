// 用于验证笔记的中间件
// 该中间件使用 express-validator 库来验证请求体中的数据
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Tag = require('../models/Tag');

const validateNote = [
  body('title')//要求标题为字符串且不能为空
    .isString()//要求为字符串
    .notEmpty()//要求不能为空
    .withMessage('Title is required'),
  body('content')//要求内容为字符串且不能为空
    .isString()
    .notEmpty()
    .withMessage('Content is required'),
  body('tag')//要求标签为数组且每个标签都是有效的 ObjectId
    .notEmpty()//要求不能为空
    .withMessage('tag is required')
    .custom(async (tag, { req }) => {
      try {
        let tagId;
        // 检查是否是有效的 ObjectId
        if (mongoose.isValidObjectId(tag)) {
          // 查找 Tag 集合中是否有匹配的 ObjectId
          const existingTag = await Tag.findById(tag);
          if (existingTag) {
            tagId = existingTag._id; // 使用现有标签的 ID
          }
        }
        // 将验证后的 tagId 存储到 req.body.tag
        req.body.tag = tagId;
        return true;
      } catch (error) {
        throw new Error(`Tag processing failed: ${error.message}`);
      }
    })
    .withMessage('Invalid tag or unable to process tag'),
  body('metadata.description')//要求描述为字符串且可以为空
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  (req, res, next) => {//中间件函数的典型签名，用于处理 HTTP 请求的中间逻辑
    const errors = validationResult(req);//收集请求中的验证错误
    if (!errors.isEmpty()) {//如果有错误
      // 返回错误信息，格式化为 { field: 'fieldName', message: 'error message' } 的数组
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
    //如果没有验证错误（errors.isEmpty() 返回 true），调用 next()，将控制权传递给下一个中间件或路由处理程序
  },
];

module.exports = validateNote;