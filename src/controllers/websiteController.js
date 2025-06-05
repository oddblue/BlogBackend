const Website = require('../models/Website');

// 获取所有网站信息
exports.getWebsites = async (req, res) => {
  try {
    const websites = await Website.find();
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 创建新网站信息
exports.createWebsite = async (req, res) => {
  try {
    const website = new Website(req.body); // 直接使用 req.body
    await website.save();
    res.status(201).json(website);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除网站信息
exports.deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findByIdAndDelete(req.params.id);
    if (!website) return res.status(404).json({ message: 'Website not found' });
    await website.deleteOne();
    res.json({ message: 'Website deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新网站信息
exports.updateWebsite = async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).json({ message: 'Website not found' });
    Object.assign(website, req.body);
    const updatedWebsite = await website.save();
    res.json(updatedWebsite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};