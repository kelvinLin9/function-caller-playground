const transcriptionModel = require('../models/transcription');

/**
 * 處理音訊轉文字的控制器
 */
class TranscriptionController {
  /**
   * 處理音訊轉文字請求
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async transcribe(req, res) {
    try {
      // 檢查是否有上傳文件
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: "請上傳音訊檔案" 
        });
      }

      // 記錄收到的文件信息
      console.log(
        `收到音訊檔案: ${req.file.originalname}, 大小: ${req.file.size} bytes`
      );

      // 使用模型轉換音訊
      const result = await transcriptionModel.transcribeAudio(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      // 根據結果返回響應
      if (result.success) {
        return res.json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error('轉錄控制器錯誤:', error);
      return res.status(500).json({
        success: false,
        error: error.message || "處理音訊時發生錯誤"
      });
    }
  }
}

module.exports = new TranscriptionController(); 