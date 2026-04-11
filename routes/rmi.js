const express = require("express");
const router = express.Router();
const Rmi = require("../models/Rmi");

// Create
router.post("/", async (req, res) => {
  try {
    const rmi = new Rmi(req.body);
    await rmi.save();

    req.io.emit("rmi:created", {
      message: "New rmi created",
      rmi:rmi
    });
    res.json(rmi);
    console.log("🔥 RMI POST HIT");
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
     req.io.emit("rmi:updated", {
      message: "rmi updated",
      rmi:rmi
    });
    res.json(rmi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


//=== clear 
router.delete("/clear",async (req,res)=>{
  try{
await Rmi.deleteMany({});

req.io.emit("rmi:cleared", {
      message: "rmi cleared",
    });

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
 const rmi =   await Rmi.findByIdAndDelete(req.params.id);

     req.io.emit("rmi:deleted", {
      message: "rmi deleted",
      rmi
    });
    res.json({ message: "Rmi deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;