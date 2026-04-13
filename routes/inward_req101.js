const express = require("express");
const router = express.Router();
const Req101Inward = require("../models/Req101Inward");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const E = {
  created: "inward-req101:created",
  updated: "inward-req101:updated",
  deleted: "inward-req101:deleted",
  cleared: "inward-req101:cleared",
};

router.post("/", async (req, res) => {
  try {
    const reqItem = new Req101Inward(req.body);
    await reqItem.save();
    req.io.emit(E.created, { message: "inward req101 created", reqItem });
    res.json(reqItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const reqs = await Req101Inward.find().populate("createdBy", "username");
  res.json(reqs);
});

router.get("/:id", async (req, res) => {
  const reqItem = await Req101Inward.findById(req.params.id).populate(
    "createdBy",
    "username"
  );
  res.json(reqItem);
});

router.put("/:id", async (req, res) => {
  try {
    const reqItem = await Req101Inward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    req.io.emit(E.updated, { message: "inward req101 updated", reqItem });
    res.json(reqItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/clear", auth, requireAdmin, async (req, res) => {
  try {
    await Req101Inward.deleteMany({});
    req.io.emit(E.cleared, { message: "inward req101 cleared" });
    res.json({ message: "All inward req101 deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const reqItem = await Req101Inward.findByIdAndDelete(req.params.id);
    req.io.emit(E.deleted, { message: "inward req101 deleted", reqItem });
    res.json({ message: "Req101 inward deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
