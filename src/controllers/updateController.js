const Update = require('../models/Update');

// 获取更新记录
exports.getUpdateds = async (req, res) => {
    try {
        const updates = await Update.find();
        res.json(updates);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// 创建更新记录
exports.createUpdated = async (req, res) => {
    try {
        const update = new Update(req.body); // 直接使用 req.body
        await update.save();
        res.status(201).json(update);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 删除更新记录
exports.deleteUpdated = async (req, res) => {
    try {
        const update = await Update.findByIdAndDelete(req.params.id);
        if (!update) return res.status(404).json({ message: 'Updated not found' });
        await update.deleteOne();
        res.json({ message: 'Update deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 更新更新记录
exports.updateUpdated = async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);
        if (!update) return res.status(404).json({ message: 'Updated not found' });
        Object.assign(update, req.body);
        const updateUpdated = await update.save();
        res.json(updateUpdated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};