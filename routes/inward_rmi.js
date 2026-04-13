const express = require("express");
const router = express.Router();
const RmiInward = require("../models/RmiInward");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const E = {
  created: "inward-rmi:created",
  updated: "inward-rmi:updated",
  deleted: "inward-rmi:deleted",
  cleared: "inward-rmi:cleared",
};

router.post("/", async (req, res) => {
  try {
    const rmi = new RmiInward(req.body);
    await rmi.save();
    req.io.emit(E.created, { message: "inward rmi created", rmi });
    res.json(rmi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const rmies = await RmiInward.find().populate("createdBy", "username");
  res.json(rmies);
});

router.get("/:id", async (req, res) => {
  const rmi = await RmiInward.findById(req.params.id).populate(
    "createdBy",
    "username"
  );
  res.json(rmi);
});

router.put("/:id", async (req, res) => {
  try {
    const rmi = await RmiInward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    req.io.emit(E.updated, { message: "inward rmi updated", rmi });
    res.json(rmi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/clear", auth, requireAdmin, async (req, res) => {
  try {
    await RmiInward.deleteMany({});
    req.io.emit(E.cleared, { message: "inward rmi cleared" });
    res.json({ message: "All inward rmi deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const rmi = await RmiInward.findByIdAndDelete(req.params.id);
    req.io.emit(E.deleted, { message: "inward rmi deleted", rmi });
    res.json({ message: "Rmi inward deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
