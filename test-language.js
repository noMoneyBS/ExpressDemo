// 测试多语言功能
const axios = require('axios');

async function testLanguage() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 测试多语言功能...\n');
  
  const testCases = [
    { language: 'zh', message: '土豆、番茄', expected: '中文' },
    { language: 'en', message: 'potato, tomato', expected: 'English' },
    { language: 'ja', message: 'じゃがいも、トマト', expected: '日本語' },
    { language: 'fr', message: 'pomme de terre, tomate', expected: 'Français' }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 测试 ${testCase.expected} 语言...`);
    
    try {
      const response = await axios.post(`${baseURL}/chat`, {
        userId: 1,
        message: testCase.message,
        language: testCase.language
      });
      
      const recipes = JSON.parse(response.data.recipes);
      const firstRecipe = recipes[0];
      
      console.log(`✅ ${testCase.expected} 测试成功`);
      console.log(`   菜名: ${firstRecipe.name}`);
      console.log(`   食材数量: ${firstRecipe.ingredients.length}`);
      console.log(`   步骤数量: ${firstRecipe.steps.length}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ ${testCase.expected} 测试失败:`, error.message);
    }
  }
  
  console.log('🎉 多语言测试完成！');
}

// 运行测试
testLanguage();
