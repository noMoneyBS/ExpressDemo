const express = require("express");
const axios = require("axios");
const router = express.Router();

// 如果不是 mock，才加载 Sequelize 模型
let Preference;
if (process.env.USE_MOCK !== "true") {
  Preference = require("../models/Preference");
}

// mock
const { getMockPreference } = require("../mocks/preferences");

router.post("/", async (req, res) => {
  const { userId, message, scene, budget } = req.body;

  try {
    let preferences;

    if (process.env.USE_MOCK === "true") {
      // mock 模式
      preferences = getMockPreference(userId);
    } else {
      // 数据库模式
      preferences = await Preference.findOne({ where: { userId } });
    }

    // 拼接用户偏好
    let prefText = "";
    if (preferences) {
      prefText = `用户偏好：${
        preferences.lowSalt ? "少盐、" : ""
      }${preferences.lowOil ? "少油、" : ""}${
        preferences.spicy ? "偏辣、" : ""
      }${preferences.vegetarian ? "素食、" : ""}${
        preferences.cuisine ? `喜欢${preferences.cuisine}、` : ""
      }`.replace(/、$/, "");
    }

    // 场景 + 预算
    let extraContext = "";
    if (scene) extraContext += `场景：${scene}。`;
    if (budget) extraContext += `预算：${budget}。`;

    // prompt
    const prompt = `
根据以下条件推荐3个不同的菜谱：
食材：${message}
${prefText}
${extraContext}

请返回 JSON 格式，结构如下：
[
  {
    "name": "菜名",
    "ingredients": ["食材1","食材2"],
    "steps": ["步骤1","步骤2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]
    `;

    // 调用 GPT
    const response = await axios.post(
      process.env.OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const recipes = response.data.choices[0].message.content;
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "生成菜谱失败" });
  }
});

module.exports = router;
