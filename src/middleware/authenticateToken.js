const { verifyToken } = require("../services/tokenService");

function authenticateToken(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  const payload = match ? verifyToken(match[1]) : null;

  if (!payload) {
    return res.status(401).json({ error: "A valid bearer token is required." });
  }

  req.auth = {
    id: Number(payload.sub),
    username: payload.username,
    role: payload.role,
  };
  return next();
}

module.exports = { authenticateToken };
