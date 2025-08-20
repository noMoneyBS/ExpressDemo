require("dotenv").config();
const express = require("express");
const { sequelize } = require("./config/database");
const User = require("./models/User");
const Preference = require("./models/Preference");
const UserPreference = require("./models/UserPreference");

const app = express();
app.use(express.json());

// 添加CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 判断当前模式
const isMock = process.env.USE_MOCK === "true";

// 同步数据库（确保表结构正确）
sequelize
  .sync()
  .then(() => console.log("✅ PostgreSQL 数据库已同步"))
  .catch((err) => console.error("❌ 数据库同步失败:", err));

// 路由
app.use("/auth", require("./routes/auth"));
app.use("/preference", require("./routes/preference"));
app.use("/chat", require("./routes/chat"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 当前模式: ${isMock ? "Mock 模式 (不使用数据库)" : "数据库模式 (PostgreSQL)"}`);
});
