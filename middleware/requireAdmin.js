const User = require("../models/User");

/** يتحقق من قاعدة البيانات (وليس من التوكن فقط) لأن الدور قد يُحدَّث دون إعادة تسجيل الدخول. */
module.exports = async function requireAdmin(req, res, next) {
  try {
    const u = await User.findById(req.user.id).select("role");
    if (!u || u.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح: يتطلب صلاحيات مدير" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
