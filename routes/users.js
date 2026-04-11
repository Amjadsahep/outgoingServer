const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken") // import library
const auth = require("../middleware/auth") //use this method with routes
const bcrypt = require("bcrypt")




//========= login ============================

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    // check does user exist !
    if (!user) {
      return res.status(400).json({ message: " username not found" });
    }

    // check password by bcrypt !
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
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
        id: user._id,
        username: user.username
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Create user
router.post("/", async (req, res) => {
  try {

    const body = req.body;

    // now encrypt password if exist 
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const user = new User(body);
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
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single user
router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

// Update user
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after'
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
router.delete("/:id", auth, async (req, res) => {
  try {
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