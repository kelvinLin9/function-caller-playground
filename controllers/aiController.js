/**
 * AI 助手控制器
 * 處理與 AI 相關的 API 請求
 */

const { processImageQuery, processChatQuery } = require('../models/aiModel');

/**
 * 處理圖片分析請求
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 回應對象
 */
async function analyzeImage(req, res) {
  try {
    const { message, imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "請提供圖片URL" });
    }

    const answer = await processImageQuery(message, imageUrl);

    if (!answer) {
      return res.status(500).json({ error: "無法生成回答" });
    }

    res.json({ response: answer });
  } catch (error) {
    console.error("API 錯誤:", error);
    res.status(500).json({ error: error.message || "處理圖片查詢時發生錯誤" });
  }
}

/**
 * 處理聊天請求
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 回應對象
 */
async function processChat(req, res) {
  try {
    // 處理 GET 請求
    if (req.method === 'GET') {
      return res.json({ 
        response: "您好！我是 AI 助手，有什麼我可以幫您的嗎？", 
        timestamp: new Date().toISOString() 
      });
    }
    
    // 處理 POST 請求
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "請提供聊天訊息" });
    }
    
    const answer = await processChatQuery(message, history);
    
    if (!answer) {
      return res.status(500).json({ error: "無法生成回答" });
    }
    
    res.json({ 
      response: answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("聊天 API 錯誤:", error);
    res.status(500).json({ error: error.message || "處理聊天請求時發生錯誤" });
  }
}

module.exports = {
  analyzeImage,
  processChat
}; 