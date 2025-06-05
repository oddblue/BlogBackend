const { body, validationResult } = require('express-validator');

const validateUpdate = [
    // 验证 description（字符串，可选）
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
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
module.exports = { validateUpdate };