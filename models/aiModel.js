/**
 * AI 助手模型
 * 負責處理與 AI 相關的業務邏輯（包括圖片辨識和聊天）
 */

const { openai } = require('../config/openaiConfig');

/**
 * 處理圖片辨識查詢
 * @param {string} query - 客戶的查詢
 * @param {string} imageUrl - 圖片URL
 * @returns {Promise<string>} - 包含回答的文字
 */
async function processImageQuery(query, imageUrl) {
  try {
    console.log(`處理圖片查詢: "${query}", 圖片: ${imageUrl}`);

    // 準備輸入
    const input = [
      {
        role: "user",
        content: [
          { type: "input_text", text: query || "這張圖片中有什麼?" },
          { type: "input_image", image_url: imageUrl },
        ],
      },
    ];

    // 發送 AI 請求
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: input,
    });

    console.log("AI 回應:", response);

    // 返回 AI 回答
    return response.output_text;
  } catch (error) {
    console.error("處理圖片查詢出錯:", error);
    throw error;
  }
}

/**
 * 處理聊天查詢
 * @param {string} message - 用戶的聊天訊息
 * @param {Array} history - 聊天歷史記錄 (可選)
 * @returns {Promise<string>} - AI 回答
 */
async function processChatQuery(message, history = []) {
  try {
    console.log(`處理聊天查詢: "${message}"`);
    
    // 準備對話歷史
    const messages = [...history, { role: "user", content: message }];
    
    // 發送 AI 請求
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      temperature: 0.7,
    });
    
    const answer = response.choices[0].message.content;
    console.log("AI 聊天回應:", answer);
    
    return answer;
  } catch (error) {
    console.error("處理聊天查詢出錯:", error);
    throw error;
  }
}

module.exports = {
  processImageQuery,
  processChatQuery
}; 