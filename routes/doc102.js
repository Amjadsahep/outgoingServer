const express = require("express");
const router = express.Router();
const Doc102 = require("../models/Doc102");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

// Create
router.post("/", async (req, res) => {
  try {
    const doc = new Doc102(req.body);
    await doc.save();
    req.io.emit("doc102:created", {
      message: "New doc created",
      doc:doc
    });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const docs = await Doc102.find().populate("createdBy", "username");
  res.json(docs);
});

// Read single
router.get("/:id", async (req, res) => {
  const doc = await Doc102.findById(req.params.id).populate("createdBy", "username");
  res.json(doc);
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const doc = await Doc102.findByIdAndUpdate(req.params.id, req.body, { new: true });
     req.io.emit("doc102:updated", {
      message: "doc102 updated",
      doc:doc
    });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//=== clear 
router.delete("/clear", auth, requireAdmin, async (req,res)=>{
  try{
await Doc102.deleteMany({});

 req.io.emit("doc102:cleared", {
      message: "doc102 cleared",
    });

res.json({
  message:"All doc102 deleted"
});

  }catch(e){
res.status(400).json({error:e.message});
  }
});


// Delete
router.delete("/:id", async (req, res) => {
  try {
   const doc = await Doc102.findByIdAndDelete(req.params.id);
    req.io.emit("doc102:deleted", {
      message: "New doc deleted",
      doc
    });
    res.json({ message: "Doc102 deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;