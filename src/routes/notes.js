const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const validateNote = require('../middleware/validateNote');

router.get('/', noteController.getAllNotes);// 获取所有笔记
router.get('/:id', noteController.getNoteById);// 获取单个笔记
router.post('/', validateNote, noteController.createNote);// 创建新笔记
router.put('/:id', validateNote, noteController.updateNote);// 更新笔记
router.delete('/:id', noteController.deleteNote);// 删除笔记


module.exports = router;