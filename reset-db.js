// 数据库重置脚本
require("dotenv").config();
const sequelize = require("./config/database");

async function resetDatabase() {
  try {
    console.log('🗑️  开始重置数据库...');
    
    // 先删除所有表（包括外键约束）
    await sequelize.drop();
    console.log('🗑️  已删除所有表');
    
    // 重新创建所有表
    await sequelize.sync();
    console.log('✅ 已重新创建所有表');
    
    console.log('✅ 数据库重置成功！');
    console.log('📋 表结构已更新：');
    console.log('   - Users 表包含: id, username, email, password, createdAt, updatedAt');
    console.log('   - Preferences 表包含: id, userId, lowSalt, lowOil, spicy, vegetarian, cuisine, createdAt, updatedAt');
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetDatabase();
