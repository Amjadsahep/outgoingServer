const mongoose = require("mongoose");

const ConsumptionSchema = new mongoose.Schema({
  unit: { type: String, required: true },
  docNum: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  notes: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Consumption", ConsumptionSchema);

