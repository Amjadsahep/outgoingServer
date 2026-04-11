const express = require("express");
const router = express.Router();
const Req101 = require("../models/Req101");

// Create
router.post("/", async (req, res) => {
  try {
    const reqItem = new Req101(req.body);
    await reqItem.save();
    res.json(reqItem);
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const reqs = await Req101.find().populate("createdBy", "username");
  res.json(reqs);
});

// Read single
router.get("/:id", async (req, res) => {
  const reqItem = await Req101.findById(req.params.id).populate("createdBy", "username");
  res.json(reqItem);
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const reqItem = await Req101.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reqItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//Delete all


router.delete("/clear",async (req,res)=>{
  try{
await Req101.deleteMany({});

res.json({
  message:"All req101 deleted"
});

  }catch(e){
res.status(400).json({error:e.message});
  }
})

// Delete one
router.delete("/:id", async (req, res) => {
  try {
    await Req101.findByIdAndDelete(req.params.id);
    res.json({ message: "Req101 deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;