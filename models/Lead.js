const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  city: String,
  description: String,
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  assignedProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  status: { type: String, enum: ['assigned', 'accepted', 'contacted', 'closed'], default: 'assigned' },
  isActive: { type: Boolean, default: true },
  statusHistory: [{ status: String, changedAt: Date, note: String }],
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

LeadSchema.index(
  { phone: 1, service: 1 }, 
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
