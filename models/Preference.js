const { sequelize, DataTypes } = require("../config/database");

const Preference = sequelize.define("Preference", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lowSalt: { type: DataTypes.BOOLEAN, defaultValue: false },
  lowOil: { type: DataTypes.BOOLEAN, defaultValue: false },
  spicy: { type: DataTypes.BOOLEAN, defaultValue: false },
  vegetarian: { type: DataTypes.BOOLEAN, defaultValue: false },
  cuisine: { type: DataTypes.STRING, defaultValue: "" },
});

module.exports = Preference;
