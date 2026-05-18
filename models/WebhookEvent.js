const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  action: String,
  processedAt: Date
});

module.exports = mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', Schema);
