const CommunityRecipe = require("../models/CommunityRecipe");
const UserInteraction = require("../models/UserInteraction");
const RecipeRating = require("../models/RecipeRating");
const User = require("../models/User");
const RatingService = require("./ratingService");
const { Op } = require("sequelize");

class CommunityService {
  /**
   * 分享食谱到社区
   * @param {number} authorId - 作者ID
   * @param {Object} recipeData - 食谱数据
   * @param {Object} authorRating - 作者评分
   * @returns {Object} 分享结果
   */
  static async shareRecipe(authorId, recipeData, authorRating = null) {
    try {
      console.log(`📝 用户 ${authorId} 分享食谱: ${recipeData.name}`);
      
      // 准备数据
      const communityRecipe = {
        authorId,
        name: recipeData.name,
        description: recipeData.description,
        cookingTime: recipeData.cookingTime,
        difficulty: recipeData.difficulty,
        servings: recipeData.servings,
        ingredients: JSON.stringify(recipeData.ingredients || []),
        steps: JSON.stringify(recipeData.steps || []),
        nutrition: JSON.stringify(recipeData.nutrition || {}),
        tips: JSON.stringify(recipeData.tips || []),
        tags: JSON.stringify(recipeData.tags || []),
        imageUrl: recipeData.imageUrl,
        authorRating: authorRating?.rating || null,
        authorComment: authorRating?.comment || null,
        isPublic: true,
        status: 'published'
      };

      const result = await CommunityRecipe.create(communityRecipe);
      
      console.log(`✅ 食谱分享成功: ${result.id}`);
      
      return {
        success: true,
        recipe: result,
        message: '食谱分享成功'
      };
    } catch (error) {
      console.error('❌ 分享食谱失败:', error);
      throw error;
    }
  }

  /**
   * 获取社区食谱列表
   * @param {Object} options - 查询选项
   * @returns {Array} 食谱列表
   */
  static async getCommunityRecipes(options = {}) {
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
      } = options;

      const offset = (page - 1) * limit;
      
      // 构建查询条件
      const where = {
        isPublic: true,
        status: 'published'
      };

      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      if (authorId) {
        where.authorId = authorId;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      // 构建查询
      const query = {
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset
      };

      // 如果有标签过滤
      if (tags.length > 0) {
        query.where.tags = {
          [Op.overlap]: tags
        };
      }

      const { count, rows } = await CommunityRecipe.findAndCountAll(query);
      
      // 处理数据
      const recipes = rows.map(recipe => ({
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        nutrition: JSON.parse(recipe.nutrition || '{}'),
        tips: JSON.parse(recipe.tips || '[]'),
        tags: JSON.parse(recipe.tags || '[]')
      }));

      return {
        recipes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('❌ 获取社区食谱失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个社区食谱详情
   * @param {number} recipeId - 食谱ID
   * @param {number} userId - 当前用户ID（可选）
   * @returns {Object} 食谱详情
   */
  static async getRecipeDetail(recipeId, userId = null) {
    try {
      const recipe = await CommunityRecipe.findOne({
        where: {
          id: recipeId,
          isPublic: true,
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ]
      });

      if (!recipe) {
        throw new Error('食谱不存在');
      }

      // 获取用户互动状态
      let userInteractions = {};
      if (userId) {
        const interactions = await UserInteraction.findAll({
          where: {
            userId,
            recipeId,
            isActive: true
          }
        });

        userInteractions = interactions.reduce((acc, interaction) => {
          acc[interaction.interactionType] = true;
          return acc;
        }, {});
      }

      // 获取评分统计
      const ratingStats = await RecipeRating.findAll({
        where: { recipeName: recipe.name },
        attributes: [
          'rating',
          'difficultyRating',
          'tasteRating',
          'healthRating',
          'tried'
        ]
      });

      const recipeData = {
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        nutrition: JSON.parse(recipe.nutrition || '{}'),
        tips: JSON.parse(recipe.tips || '[]'),
        tags: JSON.parse(recipe.tags || '[]'),
        userInteractions,
        ratingStats: {
          totalRatings: ratingStats.length,
          averageRating: ratingStats.length > 0 
            ? (ratingStats.reduce((sum, r) => sum + r.rating, 0) / ratingStats.length).toFixed(1)
            : 0,
          triedCount: ratingStats.filter(r => r.tried).length
        }
      };

      return recipeData;
    } catch (error) {
      console.error('❌ 获取食谱详情失败:', error);
      throw error;
    }
  }

  /**
   * 用户互动（点赞、收藏、尝试）
   * @param {number} userId - 用户ID
   * @param {number} recipeId - 食谱ID
   * @param {string} interactionType - 互动类型
   * @param {boolean} isActive - 是否激活
   * @returns {Object} 互动结果
   */
  static async toggleInteraction(userId, recipeId, interactionType, isActive) {
    try {
      console.log(`🔄 用户 ${userId} ${isActive ? '添加' : '取消'} ${interactionType}: 食谱 ${recipeId}`);

      // 查找或创建互动记录
      const [interaction, created] = await UserInteraction.findOrCreate({
        where: {
          userId,
          recipeId,
          interactionType
        },
        defaults: {
          isActive: false
        }
      });

      // 更新状态
      await interaction.update({ isActive });

      // 更新食谱统计
      const recipe = await CommunityRecipe.findByPk(recipeId);
      if (recipe) {
        const currentInteractions = await UserInteraction.count({
          where: {
            recipeId,
            interactionType,
            isActive: true
          }
        });

        // 更新相应的统计字段
        switch (interactionType) {
          case 'like':
            await recipe.update({ likes: currentInteractions });
            break;
          case 'favorite':
            await recipe.update({ favorites: currentInteractions });
            break;
          case 'try':
            await recipe.update({ tryCount: currentInteractions });
            break;
        }
      }

      return {
        success: true,
        interaction: {
          type: interactionType,
          isActive
        },
        message: `${isActive ? '添加' : '取消'}${interactionType}成功`
      };
    } catch (error) {
      console.error('❌ 用户互动失败:', error);
      throw error;
    }
  }

  /**
   * 为社区食谱评分
   * @param {number} userId - 用户ID
   * @param {number} recipeId - 食谱ID
   * @param {Object} ratingData - 评分数据
   * @returns {Object} 评分结果
   */
  static async rateCommunityRecipe(userId, recipeId, ratingData) {
    try {
      console.log(`📝 用户 ${userId} 为社区食谱 ${recipeId} 评分`);

      // 获取食谱信息
      const recipe = await CommunityRecipe.findByPk(recipeId);
      if (!recipe) {
        throw new Error('食谱不存在');
      }

      // 添加评分
      const ratingResult = await RatingService.addRating(userId, {
        name: recipe.name,
        ingredients: JSON.parse(recipe.ingredients),
        tags: JSON.parse(recipe.tags || '[]')
      }, ratingData);

      // 更新食谱的平均评分
      const allRatings = await RecipeRating.findAll({
        where: { recipeName: recipe.name }
      });

      if (allRatings.length > 0) {
        const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        await recipe.update({
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingCount: allRatings.length
        });
      }

      return {
        success: true,
        rating: ratingResult.rating,
        message: '评分成功'
      };
    } catch (error) {
      console.error('❌ 社区食谱评分失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门食谱
   * @param {number} limit - 限制数量
   * @returns {Array} 热门食谱列表
   */
  static async getPopularRecipes(limit = 10) {
    try {
      const recipes = await CommunityRecipe.findAll({
        where: {
          isPublic: true,
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ],
        order: [
          ['likes', 'DESC'],
          ['averageRating', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit
      });

      return recipes.map(recipe => ({
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        nutrition: JSON.parse(recipe.nutrition || '{}'),
        tips: JSON.parse(recipe.tips || '[]'),
        tags: JSON.parse(recipe.tags || '[]')
      }));
    } catch (error) {
      console.error('❌ 获取热门食谱失败:', error);
      throw error;
    }
  }

  /**
   * 获取最新食谱
   * @param {number} limit - 限制数量
   * @returns {Array} 最新食谱列表
   */
  static async getLatestRecipes(limit = 10) {
    try {
      const recipes = await CommunityRecipe.findAll({
        where: {
          isPublic: true,
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });

      return recipes.map(recipe => ({
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        nutrition: JSON.parse(recipe.nutrition || '{}'),
        tips: JSON.parse(recipe.tips || '[]'),
        tags: JSON.parse(recipe.tags || '[]')
      }));
    } catch (error) {
      console.error('❌ 获取最新食谱失败:', error);
      throw error;
    }
  }

  /**
   * 搜索食谱
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Array} 搜索结果
   */
  static async searchRecipes(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        tags = [],
        difficulty = null
      } = options;

      const offset = (page - 1) * limit;
      
      const where = {
        isPublic: true,
        status: 'published',
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      };

      if (difficulty) {
        where.difficulty = difficulty;
      }

      const { count, rows } = await CommunityRecipe.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const recipes = rows.map(recipe => ({
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        nutrition: JSON.parse(recipe.nutrition || '{}'),
        tips: JSON.parse(recipe.tips || '[]'),
        tags: JSON.parse(recipe.tags || '[]')
      }));

      return {
        recipes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('❌ 搜索食谱失败:', error);
      throw error;
    }
  }
}

module.exports = CommunityService;
