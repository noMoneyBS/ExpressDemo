const { sequelize, DataTypes } = require("../config/database");

const CommunityRecipe = sequelize.define("CommunityRecipe", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 分享者ID
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  // 食谱名称
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 食谱描述
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 烹饪时间
  cookingTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 难度等级
  difficulty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 份量
  servings: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 食材列表 (JSON格式)
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JSON格式存储食材列表'
  },
  // 步骤列表 (JSON格式)
  steps: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JSON格式存储步骤列表'
  },
  // 营养信息 (JSON格式)
  nutrition: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储营养信息'
  },
  // 烹饪小贴士 (JSON格式)
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储烹饪小贴士'
  },
  // 标签 (JSON格式)
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON格式存储标签列表'
  },
  // 食谱图片URL
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 作者评分
  authorRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  // 作者评论
  authorComment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 是否公开
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // 点赞数
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // 收藏数
  favorites: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // 尝试次数
  tryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // 平均评分
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  // 评分数量
  ratingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // 状态 (draft, published, archived)
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'published'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['authorId']
    },
    {
      fields: ['isPublic', 'status']
    },
    {
      fields: ['averageRating']
    },
    {
      fields: ['likes']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = CommunityRecipe;
