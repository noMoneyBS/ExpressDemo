const { sequelize, DataTypes } = require("../config/database");

const UserInteraction = sequelize.define("UserInteraction", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 用户ID
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  // 社区食谱ID
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CommunityRecipes',
      key: 'id'
    }
  },
  // 互动类型 (like, favorite, try)
  interactionType: {
    type: DataTypes.ENUM('like', 'favorite', 'try'),
    allowNull: false
  },
  // 是否激活
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'recipeId', 'interactionType'],
      unique: true
    },
    {
      fields: ['recipeId', 'interactionType']
    }
  ]
});

module.exports = UserInteraction;
