const axios = require("axios");
const FormData = require("form-data");

/**
 * 負責音訊轉文字的核心邏輯
 */
class TranscriptionModel {
  /**
   * 將音訊轉換為文字
   * @param {Buffer} audioBuffer - 音訊文件的緩衝區
   * @param {string} mimeType - 音訊文件的MIME類型
   * @param {string} originalFilename - 原始檔案名稱
   * @returns {Promise<Object>} - 轉錄結果
   */
  async transcribeAudio(audioBuffer, mimeType, originalFilename) {
    try {
      // 取得副檔名
      const extension = originalFilename.split(".").pop() || "mp3";

      // 創建 FormData
      const form = new FormData();
      form.append("model", "whisper-1");
      form.append("language", "zh");

      // 直接將緩衝區添加到 FormData
      form.append("file", audioBuffer, {
        filename: `audio.${extension}`,
        contentType: mimeType,
      });

      // 使用 axios 發送請求到 OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      return {
        success: true,
        text: response.data.text,
      };
    } catch (error) {
      console.error("音訊轉錄錯誤:", error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}

module.exports = new TranscriptionModel(); 