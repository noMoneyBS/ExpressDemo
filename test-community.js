// 测试社区功能
const axios = require('axios');

async function testCommunity() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 测试社区功能...\n');
  
  try {
    // 1. 分享食谱到社区
    console.log('📝 步骤1: 分享食谱到社区...');
    const testRecipe = {
      name: "番茄炒蛋",
      description: "经典的家常菜，简单易做",
      cookingTime: "10分钟",
      difficulty: "简单",
      servings: "2人份",
      ingredients: [
        { name: "番茄", amount: "2个" },
        { name: "鸡蛋", amount: "3个" },
        { name: "葱花", amount: "适量" },
        { name: "盐", amount: "适量" }
      ],
      steps: [
        { step: 1, instruction: "番茄切块，鸡蛋打散", time: "2分钟" },
        { step: 2, instruction: "热油炒蛋，盛出备用", time: "3分钟" },
        { step: 3, instruction: "炒番茄，加盐调味", time: "3分钟" },
        { step: 4, instruction: "加入炒好的鸡蛋，撒葱花", time: "2分钟" }
      ],
      nutrition: {
        calories: "200 kcal",
        protein: "12 g",
        fat: "8 g",
        carbs: "15 g"
      },
      tips: ["番茄要选熟的", "鸡蛋不要炒太老"],
      tags: ["中餐", "快手菜", "家常菜"]
    };

    const authorRating = {
      rating: 5,
      comment: "非常好吃，简单易做",
      tried: true,
      difficultyRating: 1,
      tasteRating: 5,
      healthRating: 4
    };

    const shareResponse = await axios.post(`${baseURL}/community/share`, {
      authorId: 1,
      recipeData: testRecipe,
      authorRating
    });

    console.log('✅ 食谱分享成功:', shareResponse.data.message);
    const sharedRecipeId = shareResponse.data.recipe.id;

    // 2. 获取社区食谱列表
    console.log('\n📝 步骤2: 获取社区食谱列表...');
    const recipesResponse = await axios.get(`${baseURL}/community/recipes`);
    
    console.log('✅ 获取到食谱列表:');
    recipesResponse.data.recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.name} (作者: ${recipe.author?.username})`);
    });

    // 3. 获取热门食谱
    console.log('\n📝 步骤3: 获取热门食谱...');
    const popularResponse = await axios.get(`${baseURL}/community/popular?limit=5`);
    
    console.log('✅ 热门食谱:');
    popularResponse.data.recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.name} (点赞: ${recipe.likes})`);
    });

    // 4. 获取最新食谱
    console.log('\n📝 步骤4: 获取最新食谱...');
    const latestResponse = await axios.get(`${baseURL}/community/latest?limit=5`);
    
    console.log('✅ 最新食谱:');
    latestResponse.data.recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.name} (时间: ${recipe.createdAt})`);
    });

    // 5. 用户互动（点赞）
    console.log('\n📝 步骤5: 用户互动（点赞）...');
    const likeResponse = await axios.post(`${baseURL}/community/recipes/${sharedRecipeId}/interact`, {
      userId: 1,
      interactionType: 'like',
      isActive: true
    });

    console.log('✅ 点赞成功:', likeResponse.data.message);

    // 6. 用户互动（收藏）
    console.log('\n📝 步骤6: 用户互动（收藏）...');
    const favoriteResponse = await axios.post(`${baseURL}/community/recipes/${sharedRecipeId}/interact`, {
      userId: 1,
      interactionType: 'favorite',
      isActive: true
    });

    console.log('✅ 收藏成功:', favoriteResponse.data.message);

    // 7. 为社区食谱评分
    console.log('\n📝 步骤7: 为社区食谱评分...');
    const ratingData = {
      rating: 4,
      comment: "味道不错，值得推荐",
      tried: true,
      difficultyRating: 2,
      tasteRating: 4,
      healthRating: 3
    };

    const rateResponse = await axios.post(`${baseURL}/community/recipes/${sharedRecipeId}/rate`, {
      userId: 1,
      ratingData
    });

    console.log('✅ 评分成功:', rateResponse.data.message);

    // 8. 获取食谱详情
    console.log('\n📝 步骤8: 获取食谱详情...');
    const detailResponse = await axios.get(`${baseURL}/community/recipes/${sharedRecipeId}?userId=1`);
    
    console.log('✅ 食谱详情:');
    console.log(`  名称: ${detailResponse.data.recipe.name}`);
    console.log(`  作者: ${detailResponse.data.recipe.author?.username}`);
    console.log(`  点赞: ${detailResponse.data.recipe.likes}`);
    console.log(`  收藏: ${detailResponse.data.recipe.favorites}`);
    console.log(`  尝试: ${detailResponse.data.recipe.tryCount}`);
    console.log(`  平均评分: ${detailResponse.data.recipe.averageRating}`);

    // 9. 搜索食谱
    console.log('\n📝 步骤9: 搜索食谱...');
    const searchResponse = await axios.get(`${baseURL}/community/search?q=番茄&limit=5`);
    
    console.log('✅ 搜索结果:');
    searchResponse.data.recipes.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.name}`);
    });

    console.log('\n🎉 社区功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testCommunity();
