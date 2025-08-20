// 检查环境变量设置
require("dotenv").config();

console.log('🔧 当前环境变量设置:');
console.log('USE_MOCK:', process.env.USE_MOCK);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置' : '未设置');
console.log('PORT:', process.env.PORT || 5001);

console.log('\n📋 当前模式:', process.env.USE_MOCK === "true" ? "Mock模式" : "数据库模式");

if (process.env.USE_MOCK !== "true") {
  console.log('⚠️  注意: 当前为数据库模式，需要确保数据库连接正常');
} else {
  console.log('✅ Mock模式: 将使用内存中的数据，不依赖数据库');
}
