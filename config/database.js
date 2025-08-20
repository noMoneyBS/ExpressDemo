const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // 关闭SQL日志
});

module.exports = { sequelize, DataTypes };
