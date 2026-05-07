const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  size: Number,
  mimetype: String,
  status: {
    type: String,
    enum: ['pending', 'uploading', 'complete', 'failed'],
    default: 'complete'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', FileSchema);