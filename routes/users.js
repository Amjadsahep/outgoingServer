const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken") // import library


//========= login ============================

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    // check does user exist !
    if (!user) {
      return res.status(400).json({ message: " username not found" });
    }

    // check password !

    if (user.password !== password) {
      return res.status(400).json({ message: " wrong password" });
    }

    // create token

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }

    );

    req.io.emit("user:login", {
      message: "User logged in",
      user: user.username,
      id: user._id
    });


    // res.jsown will return token and user !!
    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,// this is the token
      user: {
        user:user
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Create user
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    req.io.emit("user:created", {
      message: "New user created",
      user: user.username,
      id: user._id
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single user
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after'
    });

    req.io.emit("user:updated", {
      message: "User updated",
      user: user.username,
      id: user._id
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

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