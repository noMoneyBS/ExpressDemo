// 测试交互式对话功能
const axios = require('axios');

async function testInteractiveChat() {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 测试交互式对话功能...\n');
  
  try {
    let conversationState = { state: "initial" };
    
    // 步骤1: 发送食材
    console.log('📝 步骤1: 发送食材...');
    const response1 = await axios.post(`${baseURL}/interactive/chat`, {
      userId: 1,
      message: "土豆、番茄",
      language: "zh",
      conversationState: conversationState
    });
    
    console.log('🤖 机器人回复:', response1.data.message);
    console.log('📋 选项:', response1.data.options?.map(opt => opt.label).join(', '));
    conversationState = { state: response1.data.state, data: response1.data.data };
    
    // 步骤2: 选择菜系
    console.log('\n📝 步骤2: 选择菜系...');
    const response2 = await axios.post(`${baseURL}/interactive/chat`, {
      userId: 1,
      message: "中餐",
      language: "zh",
      conversationState: conversationState
    });
    
    console.log('🤖 机器人回复:', response2.data.message);
    console.log('📋 选项:', response2.data.options?.map(opt => opt.label).join(', '));
    conversationState = { state: response2.data.state, data: response2.data.data };
    
    // 步骤3: 选择烹饪时间
    console.log('\n📝 步骤3: 选择烹饪时间...');
    const response3 = await axios.post(`${baseURL}/interactive/chat`, {
      userId: 1,
      message: "中等时间",
      language: "zh",
      conversationState: conversationState
    });
    
    console.log('🤖 机器人回复:', response3.data.message);
    console.log('📋 选项:', response3.data.options?.map(opt => opt.label).join(', '));
    conversationState = { state: response3.data.state, data: response3.data.data };
    
    // 步骤4: 选择口味
    console.log('\n📝 步骤4: 选择口味...');
    const response4 = await axios.post(`${baseURL}/interactive/chat`, {
      userId: 1,
      message: "清淡",
      language: "zh",
      conversationState: conversationState
    });
    
    console.log('🤖 机器人回复:', response4.data.message);
    
    if (response4.data.type === 'recipes') {
      console.log('🍽️  生成食谱成功！');
      try {
        const recipes = JSON.parse(response4.data.recipes);
        console.log(`📊 生成了 ${recipes.length} 个食谱`);
        console.log('🍳 第一个食谱:', recipes[0].name);
      } catch (error) {
        console.log('📄 食谱数据:', response4.data.recipes.substring(0, 200) + '...');
      }
    }
    
    console.log('\n🎉 交互式对话测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testInteractiveChat();
