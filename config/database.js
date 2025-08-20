const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // 关闭SQL日志
});

// 定义模型关联关系
const setupAssociations = () => {
  const User = require("../models/User");
  const Preference = require("../models/Preference");
  const UserPreference = require("../models/UserPreference");
  const RecipeRating = require("../models/RecipeRating");
  const CommunityRecipe = require("../models/CommunityRecipe");
  const UserInteraction = require("../models/UserInteraction");

  // User 关联
  User.hasOne(Preference, { foreignKey: "userId" });
  Preference.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(UserPreference, { foreignKey: "userId" });
  UserPreference.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(RecipeRating, { foreignKey: "userId" });
  RecipeRating.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(CommunityRecipe, { foreignKey: "authorId", as: "author" });
  CommunityRecipe.belongsTo(User, { foreignKey: "authorId", as: "author" });

  User.hasMany(UserInteraction, { foreignKey: "userId" });
  UserInteraction.belongsTo(User, { foreignKey: "userId" });

  // CommunityRecipe 关联
  CommunityRecipe.hasMany(UserInteraction, { foreignKey: "recipeId" });
  UserInteraction.belongsTo(CommunityRecipe, { foreignKey: "recipeId" });
};

// 初始化数据库连接和模型
const initializeDatabase = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 设置模型关联
    setupAssociations();
    
    // 同步数据库（开发环境使用）
    await sequelize.sync({ force: false });
    console.log('数据库同步完成');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = { sequelize, DataTypes, initializeDatabase };
