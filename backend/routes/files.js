const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const File = require('../models/File');
const Notification = require('../models/Notification');

router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const io = req.app.get('io');
    const files = req.files;
    const isBulk = files.length > 3;

    const savedFiles = await Promise.all(files.map(async (file) => {
      const newFile = new File({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        status: 'complete'
      });
      return await newFile.save();
    }));

    const message = `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`;
    const notification = new Notification({ message, type: 'success' });
    await notification.save();

    io.emit('notification', {
      message,
      type: 'success',
      createdAt: notification.createdAt,
      isBulk
    });

    res.json({ success: true, files: savedFiles, isBulk });
  } catch (err) {
    const notification = new Notification({
      message: 'Upload failed: ' + err.message,
      type: 'error'
    });
    await notification.save();
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const files = await File.find().sort({ uploadDate: -1 });
  res.json(files);
});

router.get('/download/:filename', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.download(filePath);
});

module.exports = router;