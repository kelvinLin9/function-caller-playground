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
      // 檢查文件大小是否超過OpenAI的限制（25MB）
      const fileSizeMB = audioBuffer.length / (1024 * 1024);
      console.log(`檔案大小: ${fileSizeMB.toFixed(2)}MB`);
      
      if (fileSizeMB > 25) {
        return {
          success: false,
          error: `文件大小(${fileSizeMB.toFixed(2)}MB)超過OpenAI API的限制(25MB)。請上傳更小的音頻文件或縮短錄音時間。`
        };
      }
      
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
      
      // 處理 API 特定錯誤
      if (error.response) {
        if (error.response.status === 413) {
          return {
            success: false,
            error: "文件大小超過API限制，最大支持25MB的音頻文件。"
          };
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}

module.exports = new TranscriptionModel(); 