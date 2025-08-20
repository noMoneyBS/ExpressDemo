class NutritionAnalysisService {
  /**
   * 分析食谱的营养成分
   * @param {Object} recipe - 食谱对象
   * @returns {Object} 营养分析结果
   */
  static analyzeRecipe(recipe) {
    try {
      const nutrition = recipe.nutrition || recipe.nutrients || {};
      
      // 提取数值
      const calories = this.extractNumber(nutrition.calories);
      const protein = this.extractNumber(nutrition.protein);
      const fat = this.extractNumber(nutrition.fat);
      const carbs = this.extractNumber(nutrition.carbs);
      const fiber = this.extractNumber(nutrition.fiber);
      
      // 计算营养评分
      const nutritionScore = this.calculateNutritionScore({
        calories, protein, fat, carbs, fiber
      });
      
      // 生成健康建议
      const healthAdvice = this.generateHealthAdvice({
        calories, protein, fat, carbs, fiber
      });
      
      // 计算营养密度
      const nutritionDensity = this.calculateNutritionDensity({
        calories, protein, fat, carbs, fiber
      });
      
      return {
        nutrition: {
          calories: { value: calories, unit: 'kcal', level: this.getCalorieLevel(calories) },
          protein: { value: protein, unit: 'g', level: this.getProteinLevel(protein) },
          fat: { value: fat, unit: 'g', level: this.getFatLevel(fat) },
          carbs: { value: carbs, unit: 'g', level: this.getCarbLevel(carbs) },
          fiber: { value: fiber, unit: 'g', level: this.getFiberLevel(fiber) }
        },
        score: nutritionScore,
        healthAdvice: healthAdvice,
        nutritionDensity: nutritionDensity,
        dietaryTags: this.generateDietaryTags(recipe),
        mealType: this.determineMealType(calories, recipe)
      };
    } catch (error) {
      console.error('营养分析失败:', error);
      return null;
    }
  }

  /**
   * 提取数值
   */
  static extractNumber(value) {
    if (!value) return 0;
    const match = value.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * 计算营养评分 (1-10分)
   */
  static calculateNutritionScore(nutrition) {
    let score = 5; // 基础分
    
    // 蛋白质评分 (理想: 20-30g)
    if (nutrition.protein >= 20 && nutrition.protein <= 30) score += 2;
    else if (nutrition.protein >= 15 && nutrition.protein <= 35) score += 1;
    
    // 脂肪评分 (理想: 10-20g)
    if (nutrition.fat >= 10 && nutrition.fat <= 20) score += 1;
    else if (nutrition.fat >= 5 && nutrition.fat <= 25) score += 0.5;
    
    // 纤维评分 (理想: 5g+)
    if (nutrition.fiber >= 5) score += 1;
    else if (nutrition.fiber >= 3) score += 0.5;
    
    // 卡路里评分 (理想: 200-400kcal)
    if (nutrition.calories >= 200 && nutrition.calories <= 400) score += 1;
    else if (nutrition.calories >= 150 && nutrition.calories <= 500) score += 0.5;
    
    return Math.min(10, Math.max(1, Math.round(score)));
  }

  /**
   * 生成健康建议
   */
  static generateHealthAdvice(nutrition) {
    const advice = [];
    
    // 蛋白质建议
    if (nutrition.protein < 15) {
      advice.push('蛋白质含量较低，建议搭配高蛋白食材');
    } else if (nutrition.protein > 35) {
      advice.push('蛋白质含量较高，适合健身增肌');
    }
    
    // 脂肪建议
    if (nutrition.fat > 25) {
      advice.push('脂肪含量较高，建议适量食用');
    } else if (nutrition.fat < 5) {
      advice.push('脂肪含量较低，适合减脂期');
    }
    
    // 纤维建议
    if (nutrition.fiber < 3) {
      advice.push('膳食纤维较少，建议搭配蔬菜');
    } else if (nutrition.fiber >= 5) {
      advice.push('膳食纤维丰富，有助于消化');
    }
    
    // 卡路里建议
    if (nutrition.calories > 500) {
      advice.push('热量较高，建议作为主餐');
    } else if (nutrition.calories < 200) {
      advice.push('热量较低，适合加餐或轻食');
    }
    
    return advice.length > 0 ? advice : ['营养均衡，适合日常食用'];
  }

  /**
   * 计算营养密度
   */
  static calculateNutritionDensity(nutrition) {
    if (nutrition.calories === 0) return 'unknown';
    
    const proteinDensity = nutrition.protein / nutrition.calories * 100;
    const fiberDensity = nutrition.fiber / nutrition.calories * 100;
    
    if (proteinDensity > 0.15 && fiberDensity > 0.02) return 'high';
    if (proteinDensity > 0.1 || fiberDensity > 0.01) return 'medium';
    return 'low';
  }

  /**
   * 生成饮食标签
   */
  static generateDietaryTags(recipe) {
    const tags = [];
    const ingredients = this.extractIngredients(recipe);
    const nutrition = recipe.nutrition || recipe.nutrients || {};
    
    // 素食检查
    const meatKeywords = ['肉', '鸡', '牛', '猪', '鱼', '虾', '蛋', 'meat', 'chicken', 'beef', 'pork', 'fish', 'shrimp', 'egg'];
    const hasMeat = meatKeywords.some(keyword => 
      ingredients.some(ing => ing.toLowerCase().includes(keyword))
    );
    
    if (!hasMeat) {
      tags.push('vegetarian');
      if (nutrition.fat && this.extractNumber(nutrition.fat) < 10) {
        tags.push('low-fat');
      }
    }
    
    // 低碳水检查
    if (nutrition.carbs && this.extractNumber(nutrition.carbs) < 20) {
      tags.push('low-carb');
    }
    
    // 高蛋白检查
    if (nutrition.protein && this.extractNumber(nutrition.protein) > 25) {
      tags.push('high-protein');
    }
    
    // 高纤维检查
    if (nutrition.fiber && this.extractNumber(nutrition.fiber) > 5) {
      tags.push('high-fiber');
    }
    
    return tags;
  }

  /**
   * 确定餐食类型
   */
  static determineMealType(calories, recipe) {
    if (calories > 500) return 'main-meal';
    if (calories > 300) return 'side-dish';
    if (calories > 150) return 'snack';
    return 'light-meal';
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
   * 获取卡路里等级
   */
  static getCalorieLevel(calories) {
    if (calories < 200) return 'low';
    if (calories < 400) return 'medium';
    return 'high';
  }

  /**
   * 获取蛋白质等级
   */
  static getProteinLevel(protein) {
    if (protein < 15) return 'low';
    if (protein < 25) return 'medium';
    return 'high';
  }

  /**
   * 获取脂肪等级
   */
  static getFatLevel(fat) {
    if (fat < 10) return 'low';
    if (fat < 20) return 'medium';
    return 'high';
  }

  /**
   * 获取碳水化合物等级
   */
  static getCarbLevel(carbs) {
    if (carbs < 20) return 'low';
    if (carbs < 40) return 'medium';
    return 'high';
  }

  /**
   * 获取纤维等级
   */
  static getFiberLevel(fiber) {
    if (fiber < 3) return 'low';
    if (fiber < 5) return 'medium';
    return 'high';
  }

  /**
   * 获取营养等级的颜色
   */
  static getLevelColor(level) {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * 获取营养等级的中文描述
   */
  static getLevelText(level, language = 'zh') {
    const texts = {
      zh: {
        low: '低',
        medium: '中',
        high: '高'
      },
      en: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      }
    };
    
    return texts[language]?.[level] || level;
  }

  /**
   * 获取饮食标签的中文描述
   */
  static getDietaryTagText(tag, language = 'zh') {
    const tags = {
      zh: {
        vegetarian: '素食',
        'low-fat': '低脂',
        'low-carb': '低碳水',
        'high-protein': '高蛋白',
        'high-fiber': '高纤维'
      },
      en: {
        vegetarian: 'Vegetarian',
        'low-fat': 'Low-fat',
        'low-carb': 'Low-carb',
        'high-protein': 'High-protein',
        'high-fiber': 'High-fiber'
      }
    };
    
    return tags[language]?.[tag] || tag;
  }
}

module.exports = NutritionAnalysisService;
