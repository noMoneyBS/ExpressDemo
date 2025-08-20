// 测试偏好学习功能
const axios = require('axios');

async function testPreferenceLearning() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 测试偏好学习功能...\n');
  
  try {
    // 1. 获取食谱推荐
    console.log('📝 步骤1: 获取食谱推荐...');
    const recipesResponse = await axios.post(`${baseURL}/chat`, {
      userId: 1,
      message: "土豆、番茄",
      language: "zh"
    });
    
    const recipes = JSON.parse(recipesResponse.data.recipes);
    console.log(`✅ 获取到 ${recipes.length} 个食谱推荐`);
    
    // 2. 模拟用户选择第一个食谱
    console.log('\n📝 步骤2: 模拟用户选择食谱...');
    const selectedRecipe = recipes[0];
    console.log(`用户选择了: ${selectedRecipe.name}`);
    
    const selectResponse = await axios.post(`${baseURL}/preference/select`, {
      userId: 1,
      selectedRecipe,
      allRecipes: recipes
    });
    
    console.log('✅ 偏好学习完成:', selectResponse.data.message);
    
    // 3. 获取用户偏好
    console.log('\n📝 步骤3: 获取用户偏好...');
    const preferencesResponse = await axios.get(`${baseURL}/preference/user/1`);
    
    console.log('✅ 用户偏好:');
    console.log(JSON.stringify(preferencesResponse.data.preferences, null, 2));
    
    // 4. 获取偏好统计
    console.log('\n📝 步骤4: 获取偏好统计...');
    const statsResponse = await axios.get(`${baseURL}/preference/stats/1`);
    
    console.log('✅ 偏好统计:');
    console.log(JSON.stringify(statsResponse.data.stats, null, 2));
    
    console.log('\n🎉 偏好学习测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testPreferenceLearning();
