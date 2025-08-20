const axios = require('axios');
const { generatePrompt } = require("../locales/prompts");

class InteractiveChatService {
  /**
   * 对话状态管理
   */
  static conversationStates = {
    INITIAL: 'initial',           // 初始状态
    CUISINE_TYPE: 'cuisine_type', // 选择菜系
    COOKING_TIME: 'cooking_time', // 选择烹饪时间
    TASTE_PREFERENCE: 'taste_preference', // 选择口味
    GENERATING: 'generating'      // 生成食谱
  };

  /**
   * 处理用户消息
   * @param {string} userId - 用户ID
   * @param {string} message - 用户消息
   * @param {string} language - 语言
   * @param {Object} conversationState - 对话状态
   * @returns {Object} 响应对象
   */
  static async handleMessage(userId, message, language, conversationState) {
    try {
      console.log(`💬 处理用户消息: ${message}, 状态: ${conversationState.state}`);

      switch (conversationState.state) {
        case this.conversationStates.INITIAL:
          return this.handleInitialState(message, language);
        
        case this.conversationStates.CUISINE_TYPE:
          return this.handleCuisineSelection(message, language, conversationState);
        
        case this.conversationStates.COOKING_TIME:
          return this.handleCookingTimeSelection(message, language, conversationState);
        
        case this.conversationStates.TASTE_PREFERENCE:
          return this.handleTasteSelection(message, language, conversationState);
        
        default:
          return this.handleInitialState(message, language);
      }
    } catch (error) {
      console.error('❌ 交互式对话处理失败:', error);
      return {
        type: 'error',
        message: this.getText(language, 'chatError'),
        state: this.conversationStates.INITIAL
      };
    }
  }

  /**
   * 处理初始状态
   */
  static handleInitialState(message, language) {
    const cuisineOptions = this.getCuisineOptions(language);
    
    return {
      type: 'question',
      message: this.getText(language, 'askCuisineType'),
      options: cuisineOptions,
      state: this.conversationStates.CUISINE_TYPE,
      data: { ingredients: message }
    };
  }

  /**
   * 处理菜系选择
   */
  static handleCuisineSelection(message, language, conversationState) {
    const cuisineType = this.parseCuisineSelection(message, language);
    
    return {
      type: 'question',
      message: this.getText(language, 'askCookingTime'),
      options: this.getCookingTimeOptions(language),
      state: this.conversationStates.COOKING_TIME,
      data: {
        ...conversationState.data,
        cuisineType: cuisineType
      }
    };
  }

  /**
   * 处理烹饪时间选择
   */
  static handleCookingTimeSelection(message, language, conversationState) {
    const cookingTime = this.parseCookingTimeSelection(message, language);
    
    return {
      type: 'question',
      message: this.getText(language, 'askTastePreference'),
      options: this.getTasteOptions(language),
      state: this.conversationStates.TASTE_PREFERENCE,
      data: {
        ...conversationState.data,
        cookingTime: cookingTime
      }
    };
  }

  /**
   * 处理口味选择并生成食谱
   */
  static async handleTasteSelection(message, language, conversationState) {
    const tastePreference = this.parseTasteSelection(message, language);
    
    // 构建完整的用户偏好
    const userPreferences = {
      ...conversationState.data,
      tastePreference: tastePreference
    };

    // 生成食谱
    return await this.generateRecipes(userPreferences, language);
  }

  /**
   * 生成食谱
   */
  static async generateRecipes(userPreferences, language) {
    try {
      console.log('🍳 开始生成个性化食谱...');
      
      // 构建提示词
      const prompt = this.buildPersonalizedPrompt(userPreferences, language);
      
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
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        };
        headers = {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        };
      }
      
      const response = await axios.post(
        process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
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
      console.log('✅ 个性化食谱生成成功');
      
      return {
        type: 'recipes',
        message: this.getText(language, 'recipesGenerated'),
        recipes: recipes,
        state: this.conversationStates.INITIAL,
        data: userPreferences
      };
      
    } catch (error) {
      console.error('❌ 食谱生成失败:', error);
      return {
        type: 'error',
        message: this.getText(language, 'recipeGenerationFailed'),
        state: this.conversationStates.INITIAL
      };
    }
  }

  /**
   * 构建个性化提示词
   */
  static buildPersonalizedPrompt(userPreferences, language) {
    const { ingredients, cuisineType, cookingTime, tastePreference } = userPreferences;
    
    const basePrompt = generatePrompt(language, ingredients, null, {});
    
    // 添加个性化偏好
    const personalizedPrompt = `${basePrompt}

个性化偏好：
- 菜系类型：${cuisineType}
- 烹饪时间：${cookingTime}
- 口味偏好：${tastePreference}

请根据以上偏好生成更符合用户需求的食谱。`;

    return personalizedPrompt;
  }

  /**
   * 获取菜系选项
   */
  static getCuisineOptions(language) {
    const options = {
      zh: [
        { value: 'chinese', label: '中餐', emoji: '🥢' },
        { value: 'western', label: '西餐', emoji: '🍽️' },
        { value: 'japanese', label: '日料', emoji: '🍱' },
        { value: 'korean', label: '韩料', emoji: '🍜' },
        { value: 'thai', label: '泰餐', emoji: '🌶️' },
        { value: 'italian', label: '意餐', emoji: '🍝' },
        { value: 'any', label: '都可以', emoji: '🌍' }
      ],
      en: [
        { value: 'chinese', label: 'Chinese', emoji: '🥢' },
        { value: 'western', label: 'Western', emoji: '🍽️' },
        { value: 'japanese', label: 'Japanese', emoji: '🍱' },
        { value: 'korean', label: 'Korean', emoji: '🍜' },
        { value: 'thai', label: 'Thai', emoji: '🌶️' },
        { value: 'italian', label: 'Italian', emoji: '🍝' },
        { value: 'any', label: 'Any', emoji: '🌍' }
      ]
    };
    
    return options[language] || options.zh;
  }

  /**
   * 获取烹饪时间选项
   */
  static getCookingTimeOptions(language) {
    const options = {
      zh: [
        { value: 'quick', label: '快手菜（15分钟内）', emoji: '⚡' },
        { value: 'medium', label: '中等时间（30分钟内）', emoji: '⏰' },
        { value: 'slow', label: '精致慢炖（1小时以上）', emoji: '🍲' },
        { value: 'any', label: '都可以', emoji: '🕐' }
      ],
      en: [
        { value: 'quick', label: 'Quick (15 min)', emoji: '⚡' },
        { value: 'medium', label: 'Medium (30 min)', emoji: '⏰' },
        { value: 'slow', label: 'Slow (1+ hour)', emoji: '🍲' },
        { value: 'any', label: 'Any', emoji: '🕐' }
      ]
    };
    
    return options[language] || options.zh;
  }

  /**
   * 获取口味选项
   */
  static getTasteOptions(language) {
    const options = {
      zh: [
        { value: 'light', label: '清淡', emoji: '🥗' },
        { value: 'spicy', label: '辣味', emoji: '🌶️' },
        { value: 'sweet', label: '甜味', emoji: '🍯' },
        { value: 'sour', label: '酸味', emoji: '🍋' },
        { value: 'rich', label: '重口味', emoji: '🍖' },
        { value: 'any', label: '都可以', emoji: '🎯' }
      ],
      en: [
        { value: 'light', label: 'Light', emoji: '🥗' },
        { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
        { value: 'sweet', label: 'Sweet', emoji: '🍯' },
        { value: 'sour', label: 'Sour', emoji: '🍋' },
        { value: 'rich', label: 'Rich', emoji: '🍖' },
        { value: 'any', label: 'Any', emoji: '🎯' }
      ]
    };
    
    return options[language] || options.zh;
  }

  /**
   * 解析菜系选择
   */
  static parseCuisineSelection(message, language) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('中') || messageLower.includes('chinese')) return 'chinese';
    if (messageLower.includes('西') || messageLower.includes('western')) return 'western';
    if (messageLower.includes('日') || messageLower.includes('japanese')) return 'japanese';
    if (messageLower.includes('韩') || messageLower.includes('korean')) return 'korean';
    if (messageLower.includes('泰') || messageLower.includes('thai')) return 'thai';
    if (messageLower.includes('意') || messageLower.includes('italian')) return 'italian';
    
    return 'any';
  }

  /**
   * 解析烹饪时间选择
   */
  static parseCookingTimeSelection(message, language) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('快') || messageLower.includes('quick')) return 'quick';
    if (messageLower.includes('慢') || messageLower.includes('slow')) return 'slow';
    if (messageLower.includes('中') || messageLower.includes('medium')) return 'medium';
    
    return 'any';
  }

  /**
   * 解析口味选择
   */
  static parseTasteSelection(message, language) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('清') || messageLower.includes('light')) return 'light';
    if (messageLower.includes('辣') || messageLower.includes('spicy')) return 'spicy';
    if (messageLower.includes('甜') || messageLower.includes('sweet')) return 'sweet';
    if (messageLower.includes('酸') || messageLower.includes('sour')) return 'sour';
    if (messageLower.includes('重') || messageLower.includes('rich')) return 'rich';
    
    return 'any';
  }

  /**
   * 获取多语言文本
   */
  static getText(language, key) {
    const texts = {
      zh: {
        askCuisineType: '您想要什么类型的菜呢？',
        askCookingTime: '您希望烹饪时间是多久呢？',
        askTastePreference: '您喜欢什么口味呢？',
        recipesGenerated: '根据您的偏好，为您推荐以下食谱：',
        chatError: '对话处理出错，请重试',
        recipeGenerationFailed: '食谱生成失败，请重试'
      },
      en: {
        askCuisineType: 'What type of cuisine would you like?',
        askCookingTime: 'How much time do you have for cooking?',
        askTastePreference: 'What taste do you prefer?',
        recipesGenerated: 'Based on your preferences, here are your recipes:',
        chatError: 'Chat processing error, please try again',
        recipeGenerationFailed: 'Recipe generation failed, please try again'
      }
    };
    
    return texts[language]?.[key] || texts.zh[key] || key;
  }
}

module.exports = InteractiveChatService;
