const userRepository = require("../repositories/userRepository");
const { hashPassword } = require("../services/passwordService");

const demoUsers = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "user123", role: "user" },
];

async function seedDemoUsers() {
  for (const user of demoUsers) {
    const existingUser = userRepository.findByUsername(user.username);
    if (existingUser) {
      if (existingUser.role !== user.role) {
        userRepository.updateRole(user.username, user.role);
      }
      continue;
    }

    userRepository.create(
      user.username,
      await hashPassword(user.password),
      user.role,
    );
  }
}

module.exports = { seedDemoUsers };
