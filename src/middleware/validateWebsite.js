const { body, validationResult } = require('express-validator');

const validateWebsite = [
  // 验证 svg（允许带 Base64 前缀）
  body('logo')
    .notEmpty()
    .withMessage('logo is required')
    .custom((value) => {
      // 检查是否为 SVG 或 PNG 的 Base64（允许带前缀或不带前缀）
      const base64Regex = /^(data:image\/(svg\+xml|png|x-icon|jpeg|webp);base64,)?([A-Za-z0-9+/=]+)$/;
      if (!base64Regex.test(value)) {
        throw new Error('Image must be a valid Base64 string (SVG or PNG)');
      }
      return true;
    }),
  // 验证 name（字符串，必填）
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Name is required'),
  // 验证 description（字符串，可选）
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  // 验证 url（合法 URL，必填）
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL must be a valid URL'),
  // 处理验证结果
  body('metadata.classify')
    .isString()
    .notEmpty()
    .withMessage('classify must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = { validateWebsite };