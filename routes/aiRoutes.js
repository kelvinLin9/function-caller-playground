/**
 * AI 助手相關路由
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const weatherController = require('../controllers/weatherController');

// 聊天頁面路由
router.get('/chat-ui', (req, res) => {
  res.render('chat', { title: 'AI 助手聊天' });
});

// 圖片分析 API 端點
router.post('/image-analysis', aiController.analyzeImage);

// 聊天 API 端點
router.post('/chat', aiController.processChat);
router.get('/chat', aiController.processChat);

// 圖片生成 API 端點
router.post('/image-generation', aiController.createImage);

// 天氣查詢 API 端點
router.post('/weather/query', weatherController.queryWeather);

module.exports = router; 