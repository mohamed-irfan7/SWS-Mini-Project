const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  res.json(notification);
});

router.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ success: true });
});

module.exports = router;