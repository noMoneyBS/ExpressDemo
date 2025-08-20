const { sequelize, DataTypes } = require("../config/database");

const RecipeRating = sequelize.define("RecipeRating", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  // 食谱名称（用于识别食谱）
  recipeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 食谱的食材组合（用于识别相似食谱）
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JSON格式存储食材列表'
  },
  // 食谱标签（用于分类）
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储标签列表'
  },
  // 评分 (1-5星)
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  // 评论
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 是否尝试过这个食谱
  tried: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // 尝试日期
  triedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // 烹饪难度评分 (1-5)
  difficultyRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  // 味道评分 (1-5)
  tasteRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  // 健康度评分 (1-5)
  healthRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'recipeName'],
      unique: true
    },
    {
      fields: ['rating']
    },
    {
      fields: ['tried']
    }
  ]
});

module.exports = RecipeRating;
