var express = require('express');
var router = express.Router();
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'OpenAI 聊天測試', messages: [] });
});

/* POST for chat */
router.post('/chat', async function(req, res, next) {
  const userMessage = req.body.message;
  let messages = req.body.messages ? JSON.parse(req.body.messages) : [];
  
  // 添加用戶訊息到對話歷史
  messages.push({ role: 'user', content: userMessage });
  
  try {
    // 調用 OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      temperature: 0.7,
    });
    
    // 獲取 AI 回覆
    const aiMessage = response.choices[0].message.content;
    
    // 添加 AI 回覆到對話歷史
    messages.push({ role: 'assistant', content: aiMessage });
    
    // 返回渲染後的頁面
    res.render('index', { 
      title: 'OpenAI 聊天測試', 
      messages: messages,
      aiResponse: aiMessage
    });
  } catch (error) {
    console.error('OpenAI API 錯誤:', error);
    res.render('index', { 
      title: 'OpenAI 聊天測試', 
      messages: messages,
      error: '呼叫 API 時發生錯誤: ' + error.message
    });
  }
});

module.exports = router;
