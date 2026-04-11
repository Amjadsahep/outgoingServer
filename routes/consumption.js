const express = require("express");
const router = express.Router();
const Consumption = require("../models/Consumption");

// Create
router.post("/", async (req, res) => {
  try {
    const item = new Consumption(req.body);
    await item.save();
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
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//=== clear 
router.delete("/clear",async (req,res)=>{
  try{
await Consumption.deleteMany({});

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
    await Consumption.findByIdAndDelete(req.params.id);
    res.json({ message: "Consumption deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




module.exports = router;