/**
 * 天氣控制器
 * 處理與天氣相關的 API 請求
 */

const { processWeatherQuery } = require('../models/weatherModel');

/**
 * 處理天氣查詢請求
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 回應對象
 */
async function queryWeather(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "請提供查詢內容" });
    }

    console.log(`收到天氣查詢: "${query}"`);
    
    try {
      const result = await processWeatherQuery(query);
      
      if (!result.answer) {
        return res.status(500).json({ error: "無法生成回答" });
      }
      
      res.json(result);
    } catch (weatherError) {
      console.error("處理天氣查詢時出錯:", weatherError);
      
      // 當 API 出錯時，提供一個基本回覆
      res.json({
        query,
        answer: `抱歉，我目前無法獲取天氣數據。可能是由於 API 許可問題或連接問題。您的問題是: "${query}"`,
        weatherData: null,
        error: weatherError.message
      });
    }
  } catch (error) {
    console.error("處理天氣查詢時出錯:", error);
    res.status(500).json({ error: error.message || "處理查詢時發生錯誤" });
  }
}

module.exports = {
  queryWeather
}; 