const express = require("express");
const router = express.Router();
const PreferenceLearner = require("../services/preferenceLearner");

// 记录用户选择的食谱
router.post("/select", async (req, res) => {
  try {
    const { userId, selectedRecipe, allRecipes } = req.body;
    
    if (!userId || !selectedRecipe || !allRecipes) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, selectedRecipe, allRecipes" 
      });
    }

    console.log(`📝 用户 ${userId} 选择了食谱: ${selectedRecipe.name}`);
    
    // 学习用户偏好
    await PreferenceLearner.learnFromSelection(userId, selectedRecipe, allRecipes);
    
    res.json({ 
      success: true, 
      message: "偏好学习完成",
      selectedRecipe: selectedRecipe.name 
    });
    
  } catch (error) {
    console.error("❌ 记录用户选择失败:", error);
    res.status(500).json({ error: "记录用户选择失败" });
  }
});

// 获取用户偏好
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const preferences = await PreferenceLearner.getUserPreferences(userId);
    
    res.json({ 
      success: true, 
      preferences 
    });
    
  } catch (error) {
    console.error("❌ 获取用户偏好失败:", error);
    res.status(500).json({ error: "获取用户偏好失败" });
  }
});

// 获取用户偏好统计
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const preferences = await PreferenceLearner.getUserPreferences(userId);
    
    // 计算统计信息
    const stats = {
      totalPreferences: 0,
      topIngredients: [],
      topCuisines: [],
      preferredDifficulty: null,
      preferredCookingTime: null,
      nutritionPreferences: []
    };

    // 统计总数
    Object.values(preferences).forEach(prefList => {
      stats.totalPreferences += prefList.length;
    });

    // 获取最受欢迎的食材
    if (preferences.ingredient) {
      stats.topIngredients = preferences.ingredient
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5);
    }

    // 获取最受欢迎的菜系
    if (preferences.cuisine) {
      stats.topCuisines = preferences.cuisine
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5);
    }

    // 获取偏好的难度
    if (preferences.difficulty) {
      stats.preferredDifficulty = preferences.difficulty
        .sort((a, b) => b.strength - a.strength)[0]?.value;
    }

    // 获取偏好的烹饪时间
    if (preferences.cooking_time) {
      stats.preferredCookingTime = preferences.cooking_time
        .sort((a, b) => b.strength - a.strength)[0]?.value;
    }

    // 获取营养偏好
    if (preferences.nutrition) {
      stats.nutritionPreferences = preferences.nutrition
        .sort((a, b) => b.strength - a.strength);
    }

    res.json({ 
      success: true, 
      stats 
    });
    
  } catch (error) {
    console.error("❌ 获取用户偏好统计失败:", error);
    res.status(500).json({ error: "获取用户偏好统计失败" });
  }
});

module.exports = router;
