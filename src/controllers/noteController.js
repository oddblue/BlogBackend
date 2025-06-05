const Note = require('../models/Note');

exports.getAllNotes = async (req, res) => { //获取所有笔记标题和标签
  const notes = await Note.find()
    .select('title')
    .populate({ path: 'tag', select: 'name' });
  res.json(notes);
};

exports.getNoteById = async (req, res) => { //获取单个笔记
  // 根据 ID 获取单个笔记，使用 populate 方法填充 tag 字段
  try {
    const note = await Note.findById(req.params.id).populate('tag');
    //根据 tag 的 ref: 'Tag'，Mongoose 在 Tag 集合中查找与 ObjectId 匹配的文档。
    //将查找到的 Tag 文档替换 tag 字段中的 ObjectId。
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNote = async (req, res) => {//创建笔记
  // 创建新笔记，使用 req.body 中的数据
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      tag: req.body.tag,
      metadata: req.body.metadata,//元数据
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateNote = async (req, res) => {//更新笔记
  // 更新笔记，使用 req.body 中的数据
  try {
    const note = await Note.findById(req.params.id);//根据 ID 查找笔记
    if (!note) return res.status(404).json({ message: 'Note not found' });
    Object.assign(note, req.body);
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteNote = async (req, res) => {//删除笔记
  // 删除笔记，根据 ID 查找并删除
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(Notification);
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

