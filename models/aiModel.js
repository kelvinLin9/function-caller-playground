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

/**
 * 生成圖片
 * @param {string} prompt - 圖片描述提示
 * @param {string} size - 圖片尺寸
 * @returns {Promise<Object>} - 包含生成圖片URL和修改後提示詞的對象
 */
async function generateImage(prompt, size = "1024x1024") {
  try {
    console.log(`生成圖片: "${prompt}", 尺寸: ${size}`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "standard",
    });

    console.log("圖片生成回應:", response);

    // 回傳生成的圖片URL
    if (response.data && response.data.length > 0) {
      return {
        url: response.data[0].url,
        revised_prompt: response.data[0].revised_prompt,
      };
    } else {
      throw new Error("無法生成圖片");
    }
  } catch (error) {
    console.error("生成圖片出錯:", error);
    throw error;
  }
}

module.exports = {
  processImageQuery,
  processChatQuery,
  generateImage
}; 