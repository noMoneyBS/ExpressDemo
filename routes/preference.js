const express = require("express");
const router = express.Router();

let Preference;
if (process.env.USE_MOCK !== "true") {
  Preference = require("../models/Preference");
}

const { getMockPreference, setMockPreference } = require("../mocks/preferences");

// 获取用户偏好
router.get("/:userId", async (req, res) => {
  try {
    let pref;

    if (process.env.USE_MOCK === "true") {
      pref = getMockPreference(req.params.userId);
    } else {
      pref = await Preference.findOne({ where: { userId: req.params.userId } });
    }

    res.json(pref || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取偏好失败" });
  }
});

// 更新用户偏好
router.post("/:userId", async (req, res) => {
  try {
    let pref;

    if (process.env.USE_MOCK === "true") {
      pref = setMockPreference(req.params.userId, req.body);
    } else {
      pref = await Preference.findOne({ where: { userId: req.params.userId } });
      if (pref) {
        await pref.update(req.body);
      } else {
        pref = await Preference.create({ userId: req.params.userId, ...req.body });
      }
    }

    res.json({ message: "偏好更新成功", preference: pref });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新偏好失败" });
  }
});

module.exports = router;
