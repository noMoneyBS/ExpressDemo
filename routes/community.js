const express = require("express");
const router = express.Router();
const CommunityService = require("../services/communityService");

// 分享食谱到社区
router.post("/share", async (req, res) => {
  try {
    const { authorId, recipeData, authorRating } = req.body;
    
    if (!authorId || !recipeData) {
      return res.status(400).json({ 
        error: "缺少必要参数: authorId, recipeData" 
      });
    }

    console.log(`📝 用户 ${authorId} 分享食谱到社区...`);
    
    const result = await CommunityService.shareRecipe(authorId, recipeData, authorRating);
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ 分享食谱失败:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "分享食谱失败" 
    });
  }
});

// 获取社区食谱列表
router.get("/recipes", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      tags = [],
      difficulty = null,
      authorId = null
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      tags: tags ? tags.split(',') : [],
      difficulty,
      authorId: authorId ? parseInt(authorId) : null
    };

    const result = await CommunityService.getCommunityRecipes(options);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error("❌ 获取社区食谱失败:", error);
    res.status(500).json({ error: "获取社区食谱失败" });
  }
});

// 获取单个社区食谱详情
router.get("/recipes/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.query;
    
    if (!recipeId) {
      return res.status(400).json({ error: "缺少食谱ID" });
    }

    const recipe = await CommunityService.getRecipeDetail(parseInt(recipeId), userId ? parseInt(userId) : null);
    
    res.json({
      success: true,
      recipe
    });
    
  } catch (error) {
    console.error("❌ 获取食谱详情失败:", error);
    res.status(500).json({ error: error.message || "获取食谱详情失败" });
  }
});

// 用户互动（点赞、收藏、尝试）
router.post("/recipes/:recipeId/interact", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, interactionType, isActive } = req.body;
    
    if (!userId || !recipeId || !interactionType) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, interactionType" 
      });
    }

    if (!['like', 'favorite', 'try'].includes(interactionType)) {
      return res.status(400).json({ 
        error: "无效的互动类型" 
      });
    }

    const result = await CommunityService.toggleInteraction(
      parseInt(userId),
      parseInt(recipeId),
      interactionType,
      isActive
    );
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ 用户互动失败:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "用户互动失败" 
    });
  }
});

// 为社区食谱评分
router.post("/recipes/:recipeId/rate", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, ratingData } = req.body;
    
    if (!userId || !ratingData) {
      return res.status(400).json({ 
        error: "缺少必要参数: userId, ratingData" 
      });
    }

    const result = await CommunityService.rateCommunityRecipe(
      parseInt(userId),
      parseInt(recipeId),
      ratingData
    );
    
    res.json(result);
    
  } catch (error) {
    console.error("❌ 社区食谱评分失败:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "评分失败" 
    });
  }
});

// 获取热门食谱
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recipes = await CommunityService.getPopularRecipes(parseInt(limit));
    
    res.json({
      success: true,
      recipes
    });
    
  } catch (error) {
    console.error("❌ 获取热门食谱失败:", error);
    res.status(500).json({ error: "获取热门食谱失败" });
  }
});

// 获取最新食谱
router.get("/latest", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recipes = await CommunityService.getLatestRecipes(parseInt(limit));
    
    res.json({
      success: true,
      recipes
    });
    
  } catch (error) {
    console.error("❌ 获取最新食谱失败:", error);
    res.status(500).json({ error: "获取最新食谱失败" });
  }
});

// 搜索食谱
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 10, tags = [], difficulty = null } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "缺少搜索关键词" });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      tags: tags ? tags.split(',') : [],
      difficulty
    };

    const result = await CommunityService.searchRecipes(q, options);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error("❌ 搜索食谱失败:", error);
    res.status(500).json({ error: "搜索食谱失败" });
  }
});

// 获取用户的社区食谱
router.get("/user/:userId/recipes", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "缺少用户ID" });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      authorId: parseInt(userId)
    };

    const result = await CommunityService.getCommunityRecipes(options);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error("❌ 获取用户食谱失败:", error);
    res.status(500).json({ error: "获取用户食谱失败" });
  }
});

module.exports = router;
