const express = require("express");
const axios = require("axios");
const router = express.Router();
const { generatePrompt } = require("../locales/prompts");

// 如果不是 mock，才加载 Sequelize 模型
let Preference;
let RatingService;
if (process.env.USE_MOCK !== "true") {
  Preference = require("../models/Preference");
  RatingService = require("../services/ratingService");
}

// mock
const { getMockPreference } = require("../mocks/preferences");

router.post("/", async (req, res) => {
  const { userId, message, scene, budget, language = "zh" } = req.body;
  
  try {
    let preferences;

    if (process.env.USE_MOCK === "true") {
      // mock 模式
      preferences = getMockPreference(userId);
    } else {
      // 数据库模式
      preferences = await Preference.findOne({ where: { userId } });
    }

    // 使用新的语言配置系统生成提示词
    const prompt = generatePrompt(language, message, preferences, { scene, budget });
    console.log("🔧 使用语言:", language, "生成食谱推荐");

    // 调用 AI API
    try {
      // 检测是否为 Gemini API
      const isGemini = process.env.OPENAI_API_URL && process.env.OPENAI_API_URL.includes('generativelanguage.googleapis.com');
      
      let requestData, headers;
      
      if (isGemini) {
        // Gemini API 格式
        requestData = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        };
        headers = {
          "Content-Type": "application/json",
        };
      } else {
        // OpenAI API 格式
        requestData = {
          model: process.env.OPENAI_MODEL,
          messages: [{ role: "user", content: prompt }],
        };
        headers = {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        };
      }
      
      const response = await axios.post(
        process.env.OPENAI_API_URL,
        requestData,
        { headers }
      );

      // 根据 API 类型解析响应
      let recipes;
      if (isGemini) {
        recipes = response.data.candidates[0].content.parts[0].text;
      } else {
        recipes = response.data.choices[0].message.content;
      }
      console.log("🔧 返回的食谱数据:", recipes);
      
      // 如果不是mock模式，尝试基于用户评分调整推荐
      if (process.env.USE_MOCK !== "true" && RatingService) {
        try {
          // 解析食谱数据
          const parsedRecipes = JSON.parse(recipes);
          
          // 基于评分调整推荐
          const adjustedRecipes = await RatingService.adjustRecommendationsByRating(userId, parsedRecipes);
          
          // 返回调整后的食谱
          recipes = JSON.stringify(adjustedRecipes);
          console.log("🔧 基于评分调整后的食谱数据:", recipes);
        } catch (error) {
          console.log("🔧 评分调整失败，使用原始推荐:", error.message);
        }
      }
      
      res.json({ recipes });
    } catch (apiError) {
      console.error("OpenAI API调用失败:", apiError.message);
      
      // 如果API调用失败，返回mock数据用于测试
      const mockRecipes = JSON.stringify([
        {
          "name": "宫保鸡丁",
          "ingredients": ["鸡胸肉", "花生", "干辣椒", "葱姜蒜"],
          "steps": ["1. 鸡胸肉切丁腌制", "2. 热油爆香干辣椒", "3. 炒制鸡丁", "4. 加入花生翻炒"],
          "nutrients": {"calories":"350 kcal","protein":"25 g","fat":"18 g"}
        },
        {
          "name": "麻婆豆腐",
          "ingredients": ["豆腐", "猪肉末", "豆瓣酱", "花椒"],
          "steps": ["1. 豆腐切块", "2. 炒制肉末", "3. 加入豆瓣酱", "4. 放入豆腐炖煮"],
          "nutrients": {"calories":"280 kcal","protein":"15 g","fat":"12 g"}
        }
      ]);
      
      console.log("🔧 使用mock食谱数据:", mockRecipes);
      res.json({ recipes: mockRecipes });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "生成菜谱失败" });
  }
});

module.exports = router;
