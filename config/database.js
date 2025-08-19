const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // 设置 true 可以调试 SQL
});

module.exports = sequelize;
