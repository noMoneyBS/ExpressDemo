// ExpressDemo/mocks/users.js

// 模拟用户存储
const mockUsers = {};

// 获取用户（按 email）
function getMockUserByEmail(email) {
  return mockUsers[email] || null;
}

// 添加用户
function addMockUser(username, email, password) {
  if (mockUsers[email]) {
    return mockUsers[email]; // 已存在就返回现有
  }
  const newUser = {
    id: Object.keys(mockUsers).length + 1,
    username,
    email,
    password, // Mock 模式不用加密，直接存明文
  };
  mockUsers[email] = newUser;
  return newUser;
}

module.exports = { getMockUserByEmail, addMockUser };
