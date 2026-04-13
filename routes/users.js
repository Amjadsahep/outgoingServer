const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "outgoing-default-secret-change-in-production";

async function hashIfPassword(body) {
  const b = { ...body };
  if (b.password && typeof b.password === "string" && b.password.length > 0) {
    b.password = await bcrypt.hash(b.password, 10);
  }
  return b;
}

//========= login ============================

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: " username not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: " wrong password" });
    }

    const role = user.role || "user";

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    req.io.emit("user:login", {
      message: "User logged in",
      user: user.username,
      id: user._id
    });

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        username: user.username,
        role,
        createdAt: user.createdAt,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user — أول مستخدم بدون توكن (مدير)، ثم يتطلب مديراً
router.post("/", async (req, res) => {
  try {
    const count = await User.countDocuments();

    if (count === 0) {
      const body = await hashIfPassword(req.body);
      body.role = "admin";
      const user = new User(body);
      await user.save();
      req.io.emit("user:created", {
        message: "First user (admin) created",
        user: user.username,
        id: user._id
      });
      const safe = user.toObject();
      delete safe.password;
      return res.status(201).json(safe);
    }

    return auth(req, res, () => {
      requireAdmin(req, res, async () => {
        try {
          const body = await hashIfPassword(req.body);
          if (!body.role) body.role = "user";
          if (!["user", "admin"].includes(body.role)) {
            return res.status(400).json({ message: "Invalid role" });
          }
          const user = new User(body);
          await user.save();
          req.io.emit("user:created", {
            message: "New user created",
            user: user.username,
            id: user._id
          });
          const safe = user.toObject();
          delete safe.password;
          res.status(201).json(safe);
        } catch (err) {
          res.status(400).json({ error: err.message });
        }
      });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all users — للمدير فقط
router.get("/", auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single user
router.get("/:id", auth, async (req, res) => {
  try {
    const requesterId = String(req.user.id);
    const targetId = String(req.params.id);
    const me = await User.findById(req.user.id).select("role");
    const isAdmin = me && me.role === "admin";

    if (requesterId !== targetId && !isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put("/:id", auth, async (req, res) => {
  try {
    const requesterId = String(req.user.id);
    const targetId = String(req.params.id);
    const me = await User.findById(req.user.id).select("role");
    const isAdmin = me && me.role === "admin";
    const isSelf = requesterId === targetId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const body = { ...req.body };
    if (!isAdmin) {
      delete body.role;
    }
    if (body.password && typeof body.password === "string" && body.password.length > 0) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    if (body.role && !["user", "admin"].includes(body.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.io.emit("user:updated", {
      message: "User updated",
      user: user.username,
      id: user._id
    });
    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user — للمدير فقط، ولا يحذف نفسه
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: "لا يمكن حذف الحساب الذي تستخدمه الآن" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.io.emit("user:deleted", {
      message: "User deleted",
      id: req.params.id,
      user: user?.username
    });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
