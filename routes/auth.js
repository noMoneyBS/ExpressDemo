const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

let User;
if (process.env.USE_MOCK !== "true") {
  User = require("../models/User"); // DB 模式
}

// Mock 用户随便登录
const { addMockUser } = require("../mocks/users");

// 注册（Mock 模式可选，直接通过也行）
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (process.env.USE_MOCK === "true") {
      // mock 模式：不验证，直接返回一个用户 id
      const user = addMockUser(username || "mockUser", email || "mock@example.com", password || "123456");
      return res.json({ message: "注册成功 (mock)", userId: user.id });
    } else {
      // 数据库模式
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      return res.json({ message: "注册成功", userId: user.id });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "注册失败" });
  }
});

// 登录
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (process.env.USE_MOCK === "true") {
        // mock 模式：随便账号密码都能登录
        const fakeUserId = Math.floor(Math.random() * 10000) + 1;
  
        // 确保偏好数据存在
        const { getMockPreference } = require("../mocks/preferences");
        getMockPreference(fakeUserId);
  
        return res.json({ message: "登录成功 (mock)", userId: fakeUserId });
      } else {
        // 数据库模式
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: "用户不存在" });
  
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "密码错误" });
  
        return res.json({ message: "登录成功", userId: user.id });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "登录失败" });
    }
  });
  
module.exports = router;
