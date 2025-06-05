const express = require('express');
const router = express.Router();
const { getWebsites, createWebsite,deleteWebsite,updateWebsite } = require('../controllers/websiteController');
const { validateWebsite } = require('../middleware/validateWebsite');


// 获取网站列表
router.get('/', getWebsites);

// 创建网站
router.post('/', validateWebsite, createWebsite);

// 删除网站
router.delete('/:id',deleteWebsite);

// 更新网站信息
router.put('/:id',updateWebsite);

module.exports = router;