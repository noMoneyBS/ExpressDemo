const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Preference = sequelize.define("Preference", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lowSalt: { type: DataTypes.BOOLEAN, defaultValue: false },
  lowOil: { type: DataTypes.BOOLEAN, defaultValue: false },
  spicy: { type: DataTypes.BOOLEAN, defaultValue: false },
  vegetarian: { type: DataTypes.BOOLEAN, defaultValue: false },
  cuisine: { type: DataTypes.STRING, defaultValue: "" },
});

// 建立关联：一个用户有一个偏好
User.hasOne(Preference, { foreignKey: "userId" });
Preference.belongsTo(User, { foreignKey: "userId" });

module.exports = Preference;
