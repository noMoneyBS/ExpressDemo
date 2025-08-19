// ExpressDemo/mocks/preferences.js

// 用对象存储不同用户的 mock 偏好
// key = userId
const mockPreferences = {
    "testUser123": {
      lowSalt: true,
      lowOil: false,
      spicy: true,
      vegetarian: false,
      cuisine: "川菜"
    },
    "default": {
      lowSalt: false,
      lowOil: false,
      spicy: false,
      vegetarian: false,
      cuisine: ""
    }
  };
  
// 获取或创建 mock 偏好
function getMockPreference(userId) {
    if (!mockPreferences[userId]) {
      mockPreferences[userId] = {
        lowSalt: false,
        lowOil: false,
        spicy: false,
        vegetarian: false,
        cuisine: ""
      };
    }
    return mockPreferences[userId];
  }
  
  // 更新 mock 偏好
  function setMockPreference(userId, newPrefs) {
    mockPreferences[userId] = { ...getMockPreference(userId), ...newPrefs };
    return mockPreferences[userId];
  }
  
  module.exports = { getMockPreference, setMockPreference };