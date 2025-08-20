const UserPreference = require("../models/UserPreference");

class PreferenceLearner {
  /**
   * 分析用户选择的食谱并更新偏好
   * @param {number} userId - 用户ID
   * @param {Object} selectedRecipe - 用户选择的食谱
   * @param {Array} allRecipes - 所有推荐的食谱
   */
  static async learnFromSelection(userId, selectedRecipe, allRecipes) {
    try {
      console.log(`🔍 开始学习用户 ${userId} 的偏好...`);
      
      // 1. 分析食材偏好
      await this.analyzeIngredientPreferences(userId, selectedRecipe, allRecipes);
      
      // 2. 分析烹饪方法偏好
      await this.analyzeCookingMethodPreferences(userId, selectedRecipe, allRecipes);
      
      // 3. 分析难度偏好
      await this.analyzeDifficultyPreferences(userId, selectedRecipe, allRecipes);
      
      // 4. 分析烹饪时间偏好
      await this.analyzeCookingTimePreferences(userId, selectedRecipe, allRecipes);
      
      // 5. 分析营养偏好
      await this.analyzeNutritionPreferences(userId, selectedRecipe, allRecipes);
      
      // 6. 分析标签偏好
      await this.analyzeTagPreferences(userId, selectedRecipe, allRecipes);
      
      console.log(`✅ 用户 ${userId} 的偏好学习完成`);
    } catch (error) {
      console.error("❌ 偏好学习失败:", error);
    }
  }

  /**
   * 分析食材偏好
   */
  static async analyzeIngredientPreferences(userId, selectedRecipe, allRecipes) {
    const selectedIngredients = this.extractIngredients(selectedRecipe);
    
    for (const ingredient of selectedIngredients) {
      // 检查这个食材在其他食谱中的出现情况
      const ingredientFrequency = allRecipes.filter(recipe => 
        this.extractIngredients(recipe).some(ing => 
          ing.toLowerCase().includes(ingredient.toLowerCase())
        )
      ).length;
      
      // 如果食材在多个食谱中出现，说明用户可能喜欢这个食材
      if (ingredientFrequency > 1) {
        await this.updatePreference(userId, 'ingredient', ingredient, 2);
      } else {
        await this.updatePreference(userId, 'ingredient', ingredient, 1);
      }
    }
  }

  /**
   * 分析烹饪方法偏好
   */
  static async analyzeCookingMethodPreferences(userId, selectedRecipe, allRecipes) {
    const cookingMethods = this.extractCookingMethods(selectedRecipe);
    
    for (const method of cookingMethods) {
      await this.updatePreference(userId, 'cooking_method', method, 1);
    }
  }

  /**
   * 分析难度偏好
   */
  static async analyzeDifficultyPreferences(userId, selectedRecipe, allRecipes) {
    if (selectedRecipe.difficulty) {
      await this.updatePreference(userId, 'difficulty', selectedRecipe.difficulty, 1);
    }
  }

  /**
   * 分析烹饪时间偏好
   */
  static async analyzeCookingTimePreferences(userId, selectedRecipe, allRecipes) {
    if (selectedRecipe.cookingTime) {
      const timeCategory = this.categorizeCookingTime(selectedRecipe.cookingTime);
      await this.updatePreference(userId, 'cooking_time', timeCategory, 1);
    }
  }

  /**
   * 分析营养偏好
   */
  static async analyzeNutritionPreferences(userId, selectedRecipe, allRecipes) {
    const nutrition = selectedRecipe.nutrition || selectedRecipe.nutrients;
    if (nutrition) {
      // 分析卡路里偏好
      const calories = this.extractCalories(nutrition.calories);
      if (calories < 300) {
        await this.updatePreference(userId, 'nutrition', 'low_calorie', 1);
      } else if (calories > 500) {
        await this.updatePreference(userId, 'nutrition', 'high_calorie', 1);
      }
      
      // 分析蛋白质偏好
      const protein = this.extractProtein(nutrition.protein);
      if (protein > 20) {
        await this.updatePreference(userId, 'nutrition', 'high_protein', 1);
      }
    }
  }

  /**
   * 分析标签偏好
   */
  static async analyzeTagPreferences(userId, selectedRecipe, allRecipes) {
    if (selectedRecipe.tags && selectedRecipe.tags.length > 0) {
      for (const tag of selectedRecipe.tags) {
        await this.updatePreference(userId, 'cuisine', tag, 1);
      }
    }
  }

  /**
   * 更新用户偏好
   */
  static async updatePreference(userId, type, value, strengthIncrement = 1) {
    try {
      const [preference, created] = await UserPreference.findOrCreate({
        where: {
          userId,
          preferenceType: type,
          preferenceValue: value
        },
        defaults: {
          strength: strengthIncrement,
          usageCount: 1
        }
      });

      if (!created) {
        // 更新现有偏好
        preference.strength = Math.min(10, preference.strength + strengthIncrement);
        preference.usageCount += 1;
        preference.lastUpdated = new Date();
        await preference.save();
      }

      console.log(`📝 更新偏好: ${type} - ${value} (强度: ${preference.strength})`);
    } catch (error) {
      console.error(`❌ 更新偏好失败: ${type} - ${value}`, error);
    }
  }

  /**
   * 获取用户偏好
   */
  static async getUserPreferences(userId) {
    try {
      const preferences = await UserPreference.findAll({
        where: { userId },
        order: [['strength', 'DESC'], ['usageCount', 'DESC']]
      });

      return preferences.reduce((acc, pref) => {
        if (!acc[pref.preferenceType]) {
          acc[pref.preferenceType] = [];
        }
        acc[pref.preferenceType].push({
          value: pref.preferenceValue,
          strength: pref.strength,
          usageCount: pref.usageCount
        });
        return acc;
      }, {});
    } catch (error) {
      console.error("❌ 获取用户偏好失败:", error);
      return {};
    }
  }

  /**
   * 提取食材列表
   */
  static extractIngredients(recipe) {
    if (!recipe.ingredients) return [];
    
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.map(ing => 
        typeof ing === 'string' ? ing : ing.name
      );
    }
    
    return [];
  }

  /**
   * 提取烹饪方法
   */
  static extractCookingMethods(recipe) {
    const methods = [];
    const text = JSON.stringify(recipe).toLowerCase();
    
    const cookingKeywords = {
      '炒': ['炒', 'stir-fry', 'sauté'],
      '煮': ['煮', 'boil', 'simmer'],
      '烤': ['烤', 'roast', 'bake', 'grill'],
      '蒸': ['蒸', 'steam'],
      '煎': ['煎', 'pan-fry', 'fry'],
      '炖': ['炖', 'stew', 'braise']
    };

    for (const [method, keywords] of Object.entries(cookingKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        methods.push(method);
      }
    }

    return methods;
  }

  /**
   * 分类烹饪时间
   */
  static categorizeCookingTime(cookingTime) {
    const timeStr = cookingTime.toString();
    const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0');
    
    if (minutes <= 15) return 'quick';
    if (minutes <= 30) return 'medium';
    if (minutes <= 60) return 'long';
    return 'very_long';
  }

  /**
   * 提取卡路里数值
   */
  static extractCalories(caloriesStr) {
    const match = caloriesStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 提取蛋白质数值
   */
  static extractProtein(proteinStr) {
    const match = proteinStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

module.exports = PreferenceLearner;
