require("dotenv").config();
const express = require("express");
const { initializeDatabase } = require("./config/database");

const app = express();
app.use(express.json());

// 添加CORS支持
app.use((req, res, next) => {
  // 允许所有来源，适配Vercel部署
  res.header('Access-Control-Allow-Origin', '*');
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

// 初始化数据库
initializeDatabase()
  .then(() => console.log("✅ PostgreSQL 数据库已初始化"))
  .catch((err) => console.error("❌ 数据库初始化失败:", err));

// 路由
app.use("/auth", require("./routes/auth"));
app.use("/preference", require("./routes/preference"));
app.use("/rating", require("./routes/rating"));
app.use("/community", require("./routes/community"));
app.use("/chat", require("./routes/chat"));
app.use("/image", require("./routes/image"));
app.use("/interactive", require("./routes/interactive"));

const PORT = process.env.PORT || 5001;

// 只在非Vercel环境下启动服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔧 当前模式: ${isMock ? "Mock 模式 (不使用数据库)" : "数据库模式 (PostgreSQL)"}`);
  });
}

// 导出app供Vercel使用
module.exports = app;
