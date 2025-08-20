const axios = require('axios');

class ImageRecognitionService {
  /**
   * 检查Vision API是否可用
   * @returns {boolean} API是否可用
   */
  static async checkApiAvailability() {
    // 检查是否配置了Vision API URL
    if (!process.env.OPENAI_VISION_API_URL) {
      console.log('⚠️ 未配置OPENAI_VISION_API_URL，图片识别功能不可用');
      return false;
    }
    
    // 检查是否有API密钥
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ 未配置OPENAI_API_KEY');
      return false;
    }
    
    console.log('✅ Vision API配置完整');
    return true;
  }

  /**
   * 识别图片中的食材
   * @param {Buffer} imageBuffer - 图片数据
   * @returns {Array} 识别到的食材列表
   */
  static async recognizeIngredients(imageBuffer, language = 'zh') {
    try {
      console.log('🔍 开始识别图片中的食材...');
      
      // 将图片转换为base64
      const base64Image = imageBuffer.toString('base64');
      
      // 构建提示词
      const prompt = this.buildPrompt(language);
      
      const response = await axios.post(
        process.env.OPENAI_VISION_API_URL || 'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.choices[0].message.content;
      console.log('✅ 图片识别结果:', result);
      
      // 解析识别结果
      return this.parseIngredients(result, language);
      
    } catch (error) {
      console.error('❌ 图片识别失败:', error.message);
      throw new Error('图片识别失败');
    }
  }

  /**
   * 构建识别提示词
   */
  static buildPrompt(language) {
    const prompts = {
      zh: `请仔细查看这张图片，识别出所有可见的食材。

请以JSON格式返回结果，格式如下：
{
  "ingredients": [
    {
      "name": "食材名称",
      "quantity": "估计数量",
      "confidence": "高/中/低"
    }
  ],
  "notes": "其他观察到的信息"
}

注意：
1. 只识别食材，不要识别调味料、厨具等
2. 数量用中文描述，如"2个"、"300g"、"一把"等
3. 如果看不清或不确定，confidence设为"低"
4. 确保返回的是有效的JSON格式`,

      en: `Please carefully examine this image and identify all visible food ingredients.

Please return the result in JSON format as follows:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "estimated quantity",
      "confidence": "high/medium/low"
    }
  ],
  "notes": "other observations"
}

Note:
1. Only identify ingredients, not seasonings, utensils, etc.
2. Use English descriptions for quantities, such as "2 pieces", "300g", "a handful", etc.
3. If unclear or uncertain, set confidence to "low"
4. Ensure the return is valid JSON format`
    };

    return prompts[language] || prompts.zh;
  }

  /**
   * 解析识别结果
   */
  static parseIngredients(result, language) {
    try {
      // 尝试解析JSON
      const parsed = JSON.parse(result);
      
      if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
        return {
          ingredients: parsed.ingredients,
          notes: parsed.notes || '',
          success: true
        };
      }
    } catch (error) {
      console.log('JSON解析失败，尝试文本解析:', error.message);
    }

    // 如果JSON解析失败，尝试文本解析
    return this.parseTextResult(result, language);
  }

  /**
   * 文本解析备用方案
   */
  static parseTextResult(text, language) {
    const ingredients = [];
    
    // 简单的文本解析逻辑
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('食材') || line.includes('ingredient') || 
          line.includes('：') || line.includes(':') || 
          line.includes('-') || line.includes('•')) {
        
        // 提取食材名称
        let name = line.replace(/[：:•\-]/g, '').trim();
        if (name) {
          ingredients.push({
            name: name,
            quantity: '适量',
            confidence: 'medium'
          });
        }
      }
    }

    return {
      ingredients: ingredients,
      notes: '通过文本解析识别',
      success: ingredients.length > 0
    };
  }
}

module.exports = ImageRecognitionService;
