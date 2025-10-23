// src/models/Config.js
const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  leaveDays: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Config || mongoose.model("Config", configSchema);
