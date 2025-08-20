const RecipeRating = require("../models/RecipeRating");
const { Op } = require("sequelize");

class RatingService {
  /**
   * 添加或更新食谱评分
   * @param {number} userId - 用户ID
   * @param {Object} recipeData - 食谱数据
   * @param {Object} ratingData - 评分数据
   * @returns {Object} 评分结果
   */
  static async addRating(userId, recipeData, ratingData) {
    try {
      console.log(`📝 用户 ${userId} 为食谱 ${recipeData.name} 添加评分...`);
      
      const {
        rating,
        comment = null,
        tried = false,
        difficultyRating = null,
        tasteRating = null,
        healthRating = null
      } = ratingData;

      // 验证评分
      if (rating < 1 || rating > 5) {
        throw new Error('评分必须在1-5之间');
      }

      // 准备食材和标签数据
      const ingredients = JSON.stringify(recipeData.ingredients || []);
      const tags = JSON.stringify(recipeData.tags || []);

      // 查找是否已有评分
      const existingRating = await RecipeRating.findOne({
        where: {
          userId,
          recipeName: recipeData.name
        }
      });

      let result;
      if (existingRating) {
        // 更新现有评分
        result = await existingRating.update({
          ingredients,
          tags,
          rating,
          comment,
          tried,
          triedDate: tried ? new Date() : null,
          difficultyRating,
          tasteRating,
          healthRating
        });
        console.log(`✅ 更新评分成功: ${rating}星`);
      } else {
        // 创建新评分
        result = await RecipeRating.create({
          userId,
          recipeName: recipeData.name,
          ingredients,
          tags,
          rating,
          comment,
          tried,
          triedDate: tried ? new Date() : null,
          difficultyRating,
          tasteRating,
          healthRating
        });
        console.log(`✅ 添加评分成功: ${rating}星`);
      }

      return {
        success: true,
        rating: result,
        message: existingRating ? '评分更新成功' : '评分添加成功'
      };

    } catch (error) {
      console.error('❌ 添加评分失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户对特定食谱的评分
   * @param {number} userId - 用户ID
   * @param {string} recipeName - 食谱名称
   * @returns {Object|null} 评分信息
   */
  static async getUserRating(userId, recipeName) {
    try {
      const rating = await RecipeRating.findOne({
        where: {
          userId,
          recipeName
        }
      });

      if (rating) {
        return {
          ...rating.toJSON(),
          ingredients: JSON.parse(rating.ingredients),
          tags: JSON.parse(rating.tags)
        };
      }

      return null;
    } catch (error) {
      console.error('❌ 获取用户评分失败:', error);
      throw error;
    }
  }

  /**
   * 获取食谱的平均评分
   * @param {string} recipeName - 食谱名称
   * @returns {Object} 评分统计
   */
  static async getRecipeAverageRating(recipeName) {
    try {
      const ratings = await RecipeRating.findAll({
        where: { recipeName },
        attributes: [
          'rating',
          'difficultyRating',
          'tasteRating',
          'healthRating',
          'tried'
        ]
      });

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: {},
          averageDifficulty: 0,
          averageTaste: 0,
          averageHealth: 0,
          triedCount: 0
        };
      }

      // 计算平均评分
      const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / ratings.length;

      // 计算评分分布
      const ratingDistribution = {};
      for (let i = 1; i <= 5; i++) {
        ratingDistribution[i] = ratings.filter(r => r.rating === i).length;
      }

      // 计算其他平均分
      const validDifficultyRatings = ratings.filter(r => r.difficultyRating);
      const validTasteRatings = ratings.filter(r => r.tasteRating);
      const validHealthRatings = ratings.filter(r => r.healthRating);

      const averageDifficulty = validDifficultyRatings.length > 0 
        ? validDifficultyRatings.reduce((sum, r) => sum + r.difficultyRating, 0) / validDifficultyRatings.length 
        : 0;

      const averageTaste = validTasteRatings.length > 0 
        ? validTasteRatings.reduce((sum, r) => sum + r.tasteRating, 0) / validTasteRatings.length 
        : 0;

      const averageHealth = validHealthRatings.length > 0 
        ? validHealthRatings.reduce((sum, r) => sum + r.healthRating, 0) / validHealthRatings.length 
        : 0;

      const triedCount = ratings.filter(r => r.tried).length;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        ratingDistribution,
        averageDifficulty: Math.round(averageDifficulty * 10) / 10,
        averageTaste: Math.round(averageTaste * 10) / 10,
        averageHealth: Math.round(averageHealth * 10) / 10,
        triedCount
      };
    } catch (error) {
      console.error('❌ 获取食谱平均评分失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的评分历史
   * @param {number} userId - 用户ID
   * @param {number} limit - 限制数量
   * @returns {Array} 评分历史
   */
  static async getUserRatingHistory(userId, limit = 20) {
    try {
      const ratings = await RecipeRating.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        limit
      });

      return ratings.map(rating => ({
        ...rating.toJSON(),
        ingredients: JSON.parse(rating.ingredients),
        tags: JSON.parse(rating.tags)
      }));
    } catch (error) {
      console.error('❌ 获取用户评分历史失败:', error);
      throw error;
    }
  }

  /**
   * 基于评分调整推荐权重
   * @param {number} userId - 用户ID
   * @param {Array} recipes - 食谱列表
   * @returns {Array} 调整后的食谱列表
   */
  static async adjustRecommendationsByRating(userId, recipes) {
    try {
      const userRatings = await RecipeRating.findAll({
        where: { userId }
      });

      if (userRatings.length === 0) {
        return recipes; // 没有评分历史，返回原列表
      }

      // 分析用户偏好
      const preferences = this.analyzeUserPreferences(userRatings);
      
      // 为每个食谱计算推荐分数
      const scoredRecipes = recipes.map(recipe => {
        const score = this.calculateRecommendationScore(recipe, preferences);
        return {
          ...recipe,
          recommendationScore: score
        };
      });

      // 按推荐分数排序
      return scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore);
    } catch (error) {
      console.error('❌ 基于评分调整推荐失败:', error);
      return recipes; // 出错时返回原列表
    }
  }

  /**
   * 分析用户偏好
   * @param {Array} ratings - 用户评分列表
   * @returns {Object} 用户偏好分析
   */
  static analyzeUserPreferences(ratings) {
    const preferences = {
      favoriteIngredients: {},
      favoriteTags: {},
      preferredDifficulty: null,
      preferredTaste: null,
      preferredHealth: null
    };

    // 分析高评分食谱的食材偏好
    const highRatings = ratings.filter(r => r.rating >= 4);
    highRatings.forEach(rating => {
      try {
        const ingredients = JSON.parse(rating.ingredients);
        ingredients.forEach(ingredient => {
          const name = ingredient.name || ingredient;
          preferences.favoriteIngredients[name] = (preferences.favoriteIngredients[name] || 0) + 1;
        });

        const tags = JSON.parse(rating.tags || '[]');
        tags.forEach(tag => {
          preferences.favoriteTags[tag] = (preferences.favoriteTags[tag] || 0) + 1;
        });
      } catch (error) {
        console.error('解析评分数据失败:', error);
      }
    });

    // 分析难度、味道、健康度偏好
    const validDifficultyRatings = ratings.filter(r => r.difficultyRating);
    const validTasteRatings = ratings.filter(r => r.tasteRating);
    const validHealthRatings = ratings.filter(r => r.healthRating);

    if (validDifficultyRatings.length > 0) {
      const avgDifficulty = validDifficultyRatings.reduce((sum, r) => sum + r.difficultyRating, 0) / validDifficultyRatings.length;
      preferences.preferredDifficulty = Math.round(avgDifficulty);
    }

    if (validTasteRatings.length > 0) {
      const avgTaste = validTasteRatings.reduce((sum, r) => sum + r.tasteRating, 0) / validTasteRatings.length;
      preferences.preferredTaste = Math.round(avgTaste);
    }

    if (validHealthRatings.length > 0) {
      const avgHealth = validHealthRatings.reduce((sum, r) => sum + r.healthRating, 0) / validHealthRatings.length;
      preferences.preferredHealth = Math.round(avgHealth);
    }

    return preferences;
  }

  /**
   * 计算食谱推荐分数
   * @param {Object} recipe - 食谱对象
   * @param {Object} preferences - 用户偏好
   * @returns {number} 推荐分数
   */
  static calculateRecommendationScore(recipe, preferences) {
    let score = 0;

    // 基于食材偏好评分
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ingredient => {
        const name = ingredient.name || ingredient;
        if (preferences.favoriteIngredients[name]) {
          score += preferences.favoriteIngredients[name] * 2;
        }
      });
    }

    // 基于标签偏好评分
    if (recipe.tags) {
      recipe.tags.forEach(tag => {
        if (preferences.favoriteTags[tag]) {
          score += preferences.favoriteTags[tag] * 1.5;
        }
      });
    }

    // 基于难度偏好评分
    if (preferences.preferredDifficulty && recipe.difficulty) {
      const difficultyMap = { '简单': 1, '中等': 2, '困难': 3 };
      const recipeDifficulty = difficultyMap[recipe.difficulty] || 2;
      const diff = Math.abs(recipeDifficulty - preferences.preferredDifficulty);
      score += (3 - diff) * 0.5; // 难度越接近偏好，分数越高
    }

    return score;
  }
}

module.exports = RatingService;
