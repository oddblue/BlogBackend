const express = require('express');
const router = express.Router();
const { getUpdateds, createUpdated, deleteUpdated, updateUpdated } = require('../controllers/updateController');
const { validateUpdate } = require('../middleware/validateUpdate');


// 获取更新记录
router.get('/', getUpdateds);

// 创建更新记录
router.post('/', validateUpdate, createUpdated);

// 删除更新记录
router.delete('/:id', deleteUpdated);

// 更新更新记录
router.put('/:id', updateUpdated);

module.exports = router;