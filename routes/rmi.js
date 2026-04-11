const express = require("express");
const router = express.Router();
const Rmi = require("../models/Rmi");

// Create
router.post("/", async (req, res) => {
  try {
    const rmi = new Rmi(req.body);
    await rmi.save();
    res.json(rmi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const rmies = await Rmi.find().populate("createdBy", "username");
  res.json(rmies);
});

// Read single
router.get("/:id", async (req, res) => {
  const rmi = await Rmi.findById(req.params.id).populate("createdBy", "username");
  res.json(rmi);
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const rmi = await Rmi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rmi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//=== clear 
router.delete("/clear",async (req,res)=>{
  try{
await Rmi.deleteMany({});

res.json({
  message:"All rmi deleted"
});

  }catch(e){
res.status(400).json({error:e.message});
  }
})

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Rmi.findByIdAndDelete(req.params.id);
    res.json({ message: "Rmi deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;