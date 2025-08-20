const express = require("express");
const router = express.Router();
const RatingService = require("../services/ratingService");

// 添加或更新食谱评分
router.post("/add", async (req, res) => {
  try {
    const { userId, recipeData, ratingData } = req.body;
    
    if (!userId || !recipeData || !ratingData) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, recipeData, ratingData" 
      });
    }

    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
      return res.status(400).json({ 
        error: "评分必须在1-5之间" 
      });
    }

    console.log(`📝 用户 ${userId} 为食谱 ${recipeData.name} 添加评分...`);
    
    const result = await RatingService.addRating(userId, recipeData, ratingData);
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ 添加评分失败:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "添加评分失败" 
    });
  }
});

// 获取用户对特定食谱的评分
router.get("/user/:userId/recipe/:recipeName", async (req, res) => {
  try {
    const { userId, recipeName } = req.params;
    
    if (!userId || !recipeName) {
      return res.status(400).json({ error: "缺少必要参数" });
    }

    const rating = await RatingService.getUserRating(userId, recipeName);
    
    res.json({ 
      success: true, 
      rating 
    });
    
  } catch (error) {
    console.error("❌ 获取用户评分失败:", error);
    res.status(500).json({ error: "获取用户评分失败" });
  }
});

// 获取食谱的平均评分
router.get("/recipe/:recipeName/average", async (req, res) => {
  try {
    const { recipeName } = req.params;
    
    if (!recipeName) {
      return res.status(400).json({ error: "缺少食谱名称" });
    }

    const averageRating = await RatingService.getRecipeAverageRating(recipeName);
    
    res.json({ 
      success: true, 
      averageRating 
    });
    
  } catch (error) {
    console.error("❌ 获取食谱平均评分失败:", error);
    res.status(500).json({ error: "获取食谱平均评分失败" });
  }
});

// 获取用户的评分历史
router.get("/user/:userId/history", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const history = await RatingService.getUserRatingHistory(userId, parseInt(limit));
    
    res.json({ 
      success: true, 
      history 
    });
    
  } catch (error) {
    console.error("❌ 获取用户评分历史失败:", error);
    res.status(500).json({ error: "获取用户评分历史失败" });
  }
});

// 基于评分调整推荐
router.post("/adjust-recommendations", async (req, res) => {
  try {
    const { userId, recipes } = req.body;
    
    if (!userId || !recipes) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, recipes" 
      });
    }

    const adjustedRecipes = await RatingService.adjustRecommendationsByRating(userId, recipes);
    
    res.json({ 
      success: true, 
      recipes: adjustedRecipes 
    });
    
  } catch (error) {
    console.error("❌ 调整推荐失败:", error);
    res.status(500).json({ error: "调整推荐失败" });
  }
});

// 获取用户评分统计
router.get("/user/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const history = await RatingService.getUserRatingHistory(userId, 1000); // 获取所有评分
    
    // 计算统计信息
    const stats = {
      totalRatings: history.length,
      averageRating: 0,
      ratingDistribution: {},
      favoriteIngredients: {},
      favoriteTags: {},
      triedCount: 0,
      recentActivity: []
    };

    if (history.length > 0) {
      // 计算平均评分
      const totalRating = history.reduce((sum, r) => sum + r.rating, 0);
      stats.averageRating = Math.round((totalRating / history.length) * 10) / 10;

      // 计算评分分布
      for (let i = 1; i <= 5; i++) {
        stats.ratingDistribution[i] = history.filter(r => r.rating === i).length;
      }

      // 统计尝试过的食谱
      stats.triedCount = history.filter(r => r.tried).length;

      // 分析最喜欢的食材
      const highRatings = history.filter(r => r.rating >= 4);
      highRatings.forEach(rating => {
        rating.ingredients.forEach(ingredient => {
          const name = ingredient.name || ingredient;
          stats.favoriteIngredients[name] = (stats.favoriteIngredients[name] || 0) + 1;
        });

        rating.tags.forEach(tag => {
          stats.favoriteTags[tag] = (stats.favoriteTags[tag] || 0) + 1;
        });
      });

      // 获取最近活动
      stats.recentActivity = history.slice(0, 5).map(r => ({
        recipeName: r.recipeName,
        rating: r.rating,
        tried: r.tried,
        updatedAt: r.updatedAt
      }));
    }

    res.json({ 
      success: true, 
      stats 
    });
    
  } catch (error) {
    console.error("❌ 获取用户评分统计失败:", error);
    res.status(500).json({ error: "获取用户评分统计失败" });
  }
});

module.exports = router;
