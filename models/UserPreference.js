const { sequelize, DataTypes } = require("../config/database");

const UserPreference = sequelize.define("UserPreference", {
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
  // 偏好类型
  preferenceType: {
    type: DataTypes.ENUM('ingredient', 'cuisine', 'cooking_method', 'difficulty', 'cooking_time', 'nutrition'),
    allowNull: false
  },
  // 偏好值
  preferenceValue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 偏好强度 (1-10)
  strength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  // 最后更新时间
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // 使用次数
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'preferenceType', 'preferenceValue'],
      unique: true
    }
  ]
});

module.exports = UserPreference;
