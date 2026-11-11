const {
  createHmac,
  randomBytes,
  timingSafeEqual,
} = require("node:crypto");

const TOKEN_LIFETIME_SECONDS = 60 * 60;
const configuredSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET must be set when NODE_ENV is production.");
}

if (!configuredSecret) {
  console.warn(
    "JWT_SECRET is not set; using a temporary development secret. Tokens will expire when the server restarts.",
  );
}

const secret = configuredSecret || randomBytes(32);

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(userId, username, role) {
  if (role !== "admin" && role !== "user") {
    throw new Error("Cannot issue a token for an unsupported user role.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: String(userId),
    username,
    role,
    iat: issuedAt,
    exp: issuedAt + TOKEN_LIFETIME_SECONDS,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

function verifyToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;
  const expectedSignature = createHmac("sha256", secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest();
  const actualSignature = Buffer.from(signaturePart, "base64url");
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(
      Buffer.from(headerPart, "base64url").toString("utf8"),
    );
    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8"),
    );
    const now = Math.floor(Date.now() / 1000);
    if (
      header.alg !== "HS256" ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string" ||
      !["admin", "user"].includes(payload.role) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  TOKEN_LIFETIME_SECONDS,
  signToken,
  verifyToken,
};
