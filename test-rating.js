// 测试评分系统功能
const axios = require('axios');

async function testRatingSystem() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 测试评分系统功能...\n');
  
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
    
    // 2. 为第一个食谱添加评分
    console.log('\n📝 步骤2: 为食谱添加评分...');
    const testRecipe = recipes[0];
    console.log(`为食谱 "${testRecipe.name}" 添加评分`);
    
    const ratingData = {
      rating: 4,
      comment: "味道不错，做法简单",
      tried: true,
      difficultyRating: 2,
      tasteRating: 4,
      healthRating: 3
    };
    
    const ratingResponse = await axios.post(`${baseURL}/rating/add`, {
      userId: 1,
      recipeData: testRecipe,
      ratingData
    });
    
    console.log('✅ 评分添加成功:', ratingResponse.data.message);
    
    // 3. 获取用户评分
    console.log('\n📝 步骤3: 获取用户评分...');
    const userRatingResponse = await axios.get(`${baseURL}/rating/user/1/recipe/${encodeURIComponent(testRecipe.name)}`);
    
    console.log('✅ 用户评分:');
    console.log(JSON.stringify(userRatingResponse.data.rating, null, 2));
    
    // 4. 获取食谱平均评分
    console.log('\n📝 步骤4: 获取食谱平均评分...');
    const averageRatingResponse = await axios.get(`${baseURL}/rating/recipe/${encodeURIComponent(testRecipe.name)}/average`);
    
    console.log('✅ 平均评分:');
    console.log(JSON.stringify(averageRatingResponse.data.averageRating, null, 2));
    
    // 5. 获取用户评分历史
    console.log('\n📝 步骤5: 获取用户评分历史...');
    const historyResponse = await axios.get(`${baseURL}/rating/user/1/history`);
    
    console.log('✅ 评分历史:');
    console.log(`共 ${historyResponse.data.history.length} 条评分记录`);
    
    // 6. 获取用户评分统计
    console.log('\n📝 步骤6: 获取用户评分统计...');
    const statsResponse = await axios.get(`${baseURL}/rating/user/1/stats`);
    
    console.log('✅ 评分统计:');
    console.log(JSON.stringify(statsResponse.data.stats, null, 2));
    
    // 7. 测试基于评分的推荐调整
    console.log('\n📝 步骤7: 测试基于评分的推荐调整...');
    const adjustResponse = await axios.post(`${baseURL}/rating/adjust-recommendations`, {
      userId: 1,
      recipes: recipes
    });
    
    console.log('✅ 调整后的推荐:');
    adjustResponse.data.recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (推荐分数: ${recipe.recommendationScore || 0})`);
    });
    
    console.log('\n🎉 评分系统测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testRatingSystem();
