/**
 * 天氣處理模型
 * 負責處理與天氣查詢相關的業務邏輯
 */

const axios = require("axios");
const { openai } = require('../config/openaiConfig');

// OpenWeatherMap API 配置
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY; // 使用新的環境變數名稱
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// 城市與座標映射（簡化版）
const CITY_COORDINATES = {
  "taipei": { lat: 25.0330, lon: 121.5654 },
  "taichung": { lat: 24.1477, lon: 120.6736 },
  "kaohsiung": { lat: 22.6273, lon: 120.3014 },
  "tainan": { lat: 22.9997, lon: 120.2270 },
  "hsinchu": { lat: 24.8138, lon: 120.9675 },
  "tokyo": { lat: 35.6762, lon: 139.6503 },
  "new york": { lat: 40.7128, lon: -74.0060 },
  "london": { lat: 51.5074, lon: -0.1278 },
  "paris": { lat: 48.8566, lon: 2.3522 },
  "sydney": { lat: -33.8688, lon: 151.2093 },
};

/**
 * 取得天氣數據
 * @param {string} city - 城市名稱
 * @returns {Promise<Object>} - 天氣數據
 */
async function getWeatherData(city) {
  try {
    // 獲取城市座標
    const cityKey = city.toLowerCase();
    const coordinates = CITY_COORDINATES[cityKey];
    
    if (!coordinates) {
      throw new Error(`無法找到城市 ${city} 的座標`);
    }
    
    const { lat, lon } = coordinates;
    
    // 獲取當前天氣
    const currentResponse = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat: lat,
        lon: lon,
        appid: WEATHER_API_KEY,
        units: 'metric', // 使用攝氏溫度
        lang: 'zh_tw',
      },
    });
    
    // 獲取天氣預報
    const forecastResponse = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        lat: lat,
        lon: lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'zh_tw',
      },
    });
    
    // 格式化數據以兼容原有結構
    const currentData = currentResponse.data;
    const forecastData = forecastResponse.data;
    
    // 將 OpenWeatherMap 數據轉換為與 WeatherAPI.com 相似的格式
    const weatherData = {
      location: {
        name: currentData.name,
        country: currentData.sys.country,
        localtime: new Date().toISOString(),
      },
      current: {
        temp_c: currentData.main.temp,
        condition: {
          text: currentData.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
        },
        humidity: currentData.main.humidity,
        wind_kph: currentData.wind.speed * 3.6, // 轉換為公里/小時
      },
      forecast: {
        forecastday: processForecastData(forecastData),
      }
    };
    
    return weatherData;
  } catch (error) {
    console.error("取得天氣數據時出錯:", error);
    throw error;
  }
}

/**
 * 處理 OpenWeatherMap 的預報數據
 * @param {Object} forecastData - OpenWeatherMap 預報數據
 * @returns {Array} - 格式化的預報數據
 */
function processForecastData(forecastData) {
  // 整理預報數據按天分組
  const dailyForecasts = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date: date,
        temps: [],
        conditions: [],
        icons: [],
      };
    }
    
    dailyForecasts[date].temps.push(item.main.temp);
    dailyForecasts[date].conditions.push(item.weather[0].description);
    dailyForecasts[date].icons.push(item.weather[0].icon);
  });
  
  // 將每天的數據匯總
  return Object.values(dailyForecasts).map(day => {
    // 找出最常見的天氣狀況和圖標
    const conditionCounts = {};
    const iconCounts = {};
    
    day.conditions.forEach(condition => {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    
    day.icons.forEach(icon => {
      iconCounts[icon] = (iconCounts[icon] || 0) + 1;
    });
    
    const mostCommonCondition = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    const mostCommonIcon = Object.entries(iconCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return {
      date: day.date,
      day: {
        maxtemp_c: Math.max(...day.temps),
        mintemp_c: Math.min(...day.temps),
        condition: {
          text: mostCommonCondition,
          icon: `http://openweathermap.org/img/wn/${mostCommonIcon}@2x.png`,
        },
      },
    };
  }).slice(0, 5); // 限制為5天預報
}

/**
 * 根據城市名稱取得天氣
 * @param {string} city - 城市名稱
 * @returns {Promise<Object>} - 天氣數據
 */
async function getWeatherByCity(city) {
  try {
    console.log(`取得城市天氣: ${city}`);
    const weatherData = await getWeatherData(city);
    return weatherData;
  } catch (error) {
    console.error("根據城市取得天氣時出錯:", error);
    throw error;
  }
}

/**
 * 處理天氣查詢
 * @param {string} query - 用戶的查詢
 * @returns {Promise<Object>} - 包含回答和天氣數據的對象
 */
async function processWeatherQuery(query) {
  try {
    // 定義可用的函式
    const tools = [
      {
        type: "function",
        name: "get_weather",
        description: "取得指定城市的天氣信息",
        parameters: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "城市名稱，例如 taipei, tokyo, new york",
            },
          },
          required: ["city"],
        },
      },
    ];

    // 準備輸入
    const input = [{ role: "user", content: query }];
    console.log(`處理天氣查詢: "${query}"`);

    // 第一次 AI 回應
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `你是一個天氣助手，可以回答用戶關於天氣的問題。
當用戶詢問天氣相關問題時，呼叫 get_weather 函式取得天氣數據。
使用繁體中文回答，簡潔友善。`,
      input,
      tools,
      tool_choice: "auto",
    });

    // 檢查是否有函式被呼叫
    if (response.output && response.output.length > 0) {
      // 檢查是否是天氣查詢
      const weatherCall = response.output.find(
        (call) => call.name === "get_weather"
      );

      if (weatherCall) {
        // 取得天氣數據
        const args = JSON.parse(weatherCall.arguments);
        const city = args.city || "taipei";

        console.log(`取得城市 "${city}" 的天氣數據`);
        const weatherData = await getWeatherByCity(city);

        // 將結果傳回 AI
        input.push(weatherCall);
        input.push({
          type: "function_call_output",
          call_id: weatherCall.call_id,
          output: JSON.stringify(weatherData),
        });

        // 取得最終回答
        const finalResponse = await openai.responses.create({
          model: "gpt-4.1-mini",
          instructions: `你是一個天氣助手，根據提供的天氣數據回答用戶問題。
使用繁體中文回答，簡潔友善。
如果用戶問的是預測性問題（如"會下雨嗎"），根據天氣描述和溫度做出合理判斷。`,
          input,
        });

        return {
          query,
          city,
          answer: finalResponse.output_text,
          weatherData,
        };
      }
    }

    // 如果沒有函式呼叫，直接返回 AI 回答
    console.log(`查詢未被識別為天氣相關問題: "${query}"，跳過 API 呼叫`);
    return {
      query,
      answer: response.output_text,
      weatherData: null,
    };
  } catch (error) {
    console.error("處理天氣查詢出錯:", error);
    throw error;
  }
}

module.exports = {
  getWeatherByCity,
  processWeatherQuery
}; 