const express = require("express");
const multer = require("multer");
const router = express.Router();
const ImageRecognitionService = require("../services/imageRecognition");

// 配置multer用于处理文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  },
});

// 检查API可用性接口
router.get("/availability", async (req, res) => {
  try {
    const isAvailable = await ImageRecognitionService.checkApiAvailability();
    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? "图片识别功能可用" : "图片识别功能不可用"
    });
  } catch (error) {
    console.error("❌ API可用性检查失败:", error);
    res.status(500).json({
      success: false,
      available: false,
      error: "API可用性检查失败"
    });
  }
});

// 图片识别接口
router.post("/recognize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请上传图片文件" });
    }

    const language = req.body.language || "zh";
    
    console.log(`📸 收到图片识别请求，语言: ${language}`);
    console.log(`📸 图片大小: ${req.file.size} bytes`);
    console.log(`📸 图片类型: ${req.file.mimetype}`);

    // 调用图片识别服务
    const result = await ImageRecognitionService.recognizeIngredients(
      req.file.buffer,
      language
    );

    if (result.success) {
      res.json({
        success: true,
        ingredients: result.ingredients,
        notes: result.notes,
        message: `成功识别到 ${result.ingredients.length} 种食材`
      });
    } else {
      res.status(400).json({
        success: false,
        error: "图片识别失败，请重试"
      });
    }

  } catch (error) {
    console.error("❌ 图片识别API错误:", error);
    res.status(500).json({
      success: false,
      error: error.message || "图片识别失败"
    });
  }
});

module.exports = router;
