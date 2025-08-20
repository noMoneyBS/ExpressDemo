const express = require("express");
const router = express.Router();
const InteractiveChatService = require("../services/interactiveChat");

// 交互式对话接口
router.post("/chat", async (req, res) => {
  try {
    const { userId, message, language = "zh", conversationState = { state: "initial" } } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, message" 
      });
    }

    console.log(`💬 交互式对话请求: 用户${userId}, 消息: ${message}`);
    
    // 处理用户消息
    const response = await InteractiveChatService.handleMessage(
      userId, 
      message, 
      language, 
      conversationState
    );
    
    res.json(response);
    
  } catch (error) {
    console.error("❌ 交互式对话失败:", error);
    res.status(500).json({ 
      type: 'error',
      message: "对话处理失败",
      state: "initial"
    });
  }
});

// 获取对话选项接口
router.get("/options/:type/:language", (req, res) => {
  try {
    const { type, language } = req.params;
    
    let options = [];
    switch (type) {
      case 'cuisine':
        options = InteractiveChatService.getCuisineOptions(language);
        break;
      case 'cooking_time':
        options = InteractiveChatService.getCookingTimeOptions(language);
        break;
      case 'taste':
        options = InteractiveChatService.getTasteOptions(language);
        break;
      default:
        return res.status(400).json({ error: "无效的选项类型" });
    }
    
    res.json({
      success: true,
      options: options
    });
    
  } catch (error) {
    console.error("❌ 获取选项失败:", error);
    res.status(500).json({ error: "获取选项失败" });
  }
});

module.exports = router;
