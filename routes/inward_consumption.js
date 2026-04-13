const express = require("express");
const router = express.Router();
const ConsumptionInward = require("../models/ConsumptionInward");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

/** يطابق تطبيق Flutter: inward-consump:* */
const E = {
  created: "inward-consump:created",
  updated: "inward-consump:updated",
  deleted: "inward-consump:deleted",
  cleared: "inward-consump:cleared",
};

router.post("/", async (req, res) => {
  try {
    const item = new ConsumptionInward(req.body);
    await item.save();
    req.io.emit(E.created, { message: "inward consumption created", item });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const items = await ConsumptionInward.find().populate("createdBy", "username");
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const item = await ConsumptionInward.findById(req.params.id).populate(
    "createdBy",
    "username"
  );
  res.json(item);
});

router.put("/:id", async (req, res) => {
  try {
    const item = await ConsumptionInward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    req.io.emit(E.updated, { message: "inward consump updated", item });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/clear", auth, requireAdmin, async (req, res) => {
  try {
    await ConsumptionInward.deleteMany({});
    req.io.emit(E.cleared, { message: "inward consump cleared" });
    res.json({ message: "All inward consumption deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await ConsumptionInward.findByIdAndDelete(req.params.id);
    req.io.emit(E.deleted, { message: "inward consump deleted", item });
    res.json({ message: "Consumption inward deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
