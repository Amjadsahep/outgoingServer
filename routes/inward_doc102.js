const express = require("express");
const router = express.Router();
const Doc102Inward = require("../models/Doc102Inward");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const E = {
  created: "inward-doc102:created",
  updated: "inward-doc102:updated",
  deleted: "inward-doc102:deleted",
  cleared: "inward-doc102:cleared",
};

router.post("/", async (req, res) => {
  try {
    const doc = new Doc102Inward(req.body);
    await doc.save();
    req.io.emit(E.created, { message: "inward doc102 created", doc });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const docs = await Doc102Inward.find().populate("createdBy", "username");
  res.json(docs);
});

router.get("/:id", async (req, res) => {
  const doc = await Doc102Inward.findById(req.params.id).populate(
    "createdBy",
    "username"
  );
  res.json(doc);
});

router.put("/:id", async (req, res) => {
  try {
    const doc = await Doc102Inward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    req.io.emit(E.updated, { message: "inward doc102 updated", doc });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/clear", auth, requireAdmin, async (req, res) => {
  try {
    await Doc102Inward.deleteMany({});
    req.io.emit(E.cleared, { message: "inward doc102 cleared" });
    res.json({ message: "All inward doc102 deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Doc102Inward.findByIdAndDelete(req.params.id);
    req.io.emit(E.deleted, { message: "inward doc102 deleted", doc });
    res.json({ message: "Doc102 inward deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
