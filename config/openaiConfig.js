/**
 * OpenAI 配置文件
 * 初始化 OpenAI API 客戶端
 */

const OpenAI = require('openai');
require('dotenv').config();

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { openai }; 