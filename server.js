require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");
const User = require("./models/User");
const Preference = require("./models/Preference");

const app = express();
app.use(express.json());

// 判断当前模式
const isMock = process.env.USE_MOCK === "true";

if (!isMock) {
  // 数据库模式才同步
  sequelize
    .sync()
    .then(() => console.log("✅ PostgreSQL 数据库已同步"))
    .catch((err) => console.error("❌ 数据库同步失败:", err));
}

// 路由
app.use("/auth", require("./routes/auth"));
app.use("/preference", require("./routes/preference"));
app.use("/chat", require("./routes/chat"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 当前模式: ${isMock ? "Mock 模式 (不使用数据库)" : "数据库模式 (PostgreSQL)"}`);
});
