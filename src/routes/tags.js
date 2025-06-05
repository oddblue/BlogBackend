const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const validateTag = require('../middleware/validateTag');

router.get('/', tagController.getAllTags);//获取所有标签
router.get('/tree', tagController.getTagTree);//获取标签树
router.get('/alltree', tagController.getTagNoteTree);//获取文件夹和笔记标签树
router.get('/getTopLevel/:id', tagController.getTopLevelFolderTree);//获取顶级文件夹id
router.get('/:id', tagController.getTagById);//获取单个标签
router.post('/', validateTag, tagController.createTag);//创建标签
router.put('/:id', validateTag, tagController.updateTag);//更新标签
router.delete('/:id', tagController.deleteTag);//删除标签

module.exports = router;