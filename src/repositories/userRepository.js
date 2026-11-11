const { database } = require("../config/database");

const findByUsernameStatement = database.prepare(
  "SELECT id, username, password_hash, role FROM users WHERE username = ?",
);
const insertUserStatement = database.prepare(
  "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
);
const updateUserRoleStatement = database.prepare(
  "UPDATE users SET role = ? WHERE username = ?",
);

function findByUsername(username) {
  return findByUsernameStatement.get(username) || null;
}

function create(username, passwordHash, role) {
  const result = insertUserStatement.run(username, passwordHash, role);
  return {
    id: Number(result.lastInsertRowid),
    username,
    role,
  };
}

function updateRole(username, role) {
  updateUserRoleStatement.run(role, username);
}

module.exports = { create, findByUsername, updateRole };
