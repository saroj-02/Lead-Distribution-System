const mongoose = require('mongoose');

const AllocationStateSchema = new mongoose.Schema({
  serviceCode: Number,
  order: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  counter: { type: Number, default: 0 }
});

module.exports = mongoose.models.AllocationState || mongoose.model('AllocationState', AllocationStateSchema);
