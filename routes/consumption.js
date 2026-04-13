const express = require("express");
const router = express.Router();
const Consumption = require("../models/Consumption");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

// Create
router.post("/", async (req, res) => {
  try {
    const item = new Consumption(req.body);
    await item.save();

     req.io.emit("consump:created", {
      message: "cons created",
      item:item
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const items = await Consumption.find().populate("createdBy", "username");
  res.json(items);
});

// Read single
router.get("/:id", async (req, res) => {
  const item = await Consumption.findById(req.params.id).populate("createdBy", "username");
  res.json(item);
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const item = await Consumption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.io.emit("consump:updated", {
      message: "consump updated",
      item:item
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//=== clear 
router.delete("/clear", auth, requireAdmin, async (req,res)=>{
  try{
await Consumption.deleteMany({});

req.io.emit("consump:cleared", {
      message: "consump cleared",
    });

res.json({
  message:"All consumption deleted"
});

  }catch(e){
res.status(400).json({error:e.message});
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
  const item =  await Consumption.findByIdAndDelete(req.params.id);
     req.io.emit("consump:deleted", {
      message: " consump deleted",
      item
    });
    res.json({ message: "Consumption deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




module.exports = router;