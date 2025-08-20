// 测试营养分析功能
const NutritionAnalysisService = require('./services/nutritionAnalysis');

function testNutritionAnalysis() {
  console.log('🧪 测试营养分析功能...\n');
  
  // 测试食谱数据
  const testRecipe = {
    name: "土豆番茄清炖汤",
    ingredients: [
      { name: "土豆", amount: "400g" },
      { name: "番茄", amount: "2个" },
      { name: "洋葱", amount: "1个" },
      { name: "大蒜", amount: "2瓣" },
      { name: "橄榄油", amount: "1大勺" }
    ],
    nutrition: {
      calories: "180 kcal",
      protein: "4 g",
      fat: "5 g",
      carbs: "28 g",
      fiber: "4 g"
    }
  };
  
  console.log('📝 测试食谱:', testRecipe.name);
  console.log('📊 原始营养数据:', testRecipe.nutrition);
  
  // 进行营养分析
  const analysis = NutritionAnalysisService.analyzeRecipe(testRecipe);
  
  if (analysis) {
    console.log('\n✅ 营养分析结果:');
    console.log('📈 营养评分:', analysis.score + '/10');
    console.log('🏷️  饮食标签:', analysis.dietaryTags.join(', '));
    console.log('🍽️  餐食类型:', analysis.mealType);
    console.log('📊 营养密度:', analysis.nutritionDensity);
    
    console.log('\n📋 详细营养信息:');
    Object.entries(analysis.nutrition).forEach(([key, nutrient]) => {
      console.log(`  ${key}: ${nutrient.value}${nutrient.unit} (${nutrient.level})`);
    });
    
    console.log('\n💡 健康建议:');
    analysis.healthAdvice.forEach((advice, index) => {
      console.log(`  ${index + 1}. ${advice}`);
    });
    
    console.log('\n🎉 营养分析测试完成！');
  } else {
    console.log('❌ 营养分析失败');
  }
}

// 运行测试
testNutritionAnalysis();
