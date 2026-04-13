const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "outgoing-default-secret-change-in-production";

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : header;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role || "user",
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = auth;
