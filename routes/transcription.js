const express = require('express');
const router = express.Router();
const multer = require('multer');
const transcriptionController = require('../controllers/transcriptionController');

// 設定檔案上傳 - 使用記憶體儲存
const upload = multer({
  storage: multer.memoryStorage(), // 使用記憶體儲存
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB 限制
  fileFilter: (req, file, cb) => {
    // 只允許音訊檔案
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('請上傳音訊檔案'));
    }
  },
});

// 音訊轉文字端點
router.post('/transcribe', upload.single('audio'), transcriptionController.transcribe);

module.exports = router; 