const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  name: String,
  code: Number,
  monthlyQuota: { type: Number, default: 10 },
  monthlyAssigned: { type: Number, default: 0 },
  leadsCount: { type: Number, default: 0 }
});

module.exports = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
