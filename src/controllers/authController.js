const userRepository = require("../repositories/userRepository");
const { signToken, TOKEN_LIFETIME_SECONDS } = require("../services/tokenService");
const { verifyPassword } = require("../services/passwordService");

async function login(req, res) {
  const { username, password } = req.body || {};
  if (
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return res.status(400).json({
      error: "Username and password are required.",
    });
  }

  const user = userRepository.findByUsername(username.trim());
  const passwordMatches =
    user && (await verifyPassword(password, user.password_hash));

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  return res.json({
    token: signToken(user.id, user.username, user.role),
    tokenType: "Bearer",
    expiresIn: TOKEN_LIFETIME_SECONDS,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
}

function getCurrentUser(req, res) {
  return res.json({ user: req.auth });
}

module.exports = { getCurrentUser, login };
